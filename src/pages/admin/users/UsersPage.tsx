import { useEffect, useState } from "react";
import { ShieldOff, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/search/SearchInput";
import { Pagination } from "@/components/pagination/Pagination";
import { DataTable } from "@/components/table/DataTable";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import {
  useGetUsersQuery,
  useToggleUserStatusMutation,
} from "@/features/users/usersApi";
import type { UserRecord } from "@/features/users/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { unwrapList } from "@/utils/list";
import { formatDate } from "@/utils/format";
import { getErrorMessage } from "@/utils/errors";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import toast from "react-hot-toast";

function isUserSuspended(user: UserRecord): boolean {
  if (user.isSuspended === true) return true;
  if (user.isBlocked === true) return true;
  if (typeof user.status === "string") {
    const s = user.status.toLowerCase();
    return s === "suspended" || s === "blocked" || s === "inactive";
  }
  return false;
}

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search);
  const [pendingUser, setPendingUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const { data, isFetching, isError, error, refetch } = useGetUsersQuery({
    page,
    limit,
    searchTerm: searchTerm || undefined,
  });
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleUserStatusMutation();
  const { items, pagination } = unwrapList<UserRecord>(data);

  const handleToggle = async () => {
    if (!pendingUser) return;
    const wasSuspended = isUserSuspended(pendingUser);
    try {
      await toggleStatus(pendingUser._id).unwrap();
      toast.success(
        wasSuspended
          ? `${pendingUser.name ?? "User"} has been activated.`
          : `${pendingUser.name ?? "User"} has been suspended.`,
      );
      setPendingUser(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const pendingIsSuspended = pendingUser ? isUserSuspended(pendingUser) : false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Directory of all registered users on the platform."
      />
      <Card className="bg-[#161310]">
        <div className="flex flex-col gap-3 p-4 sm:flex-row">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search users..."
          />
        </div>
        {isError ? (
          <div className="p-4">
            <ErrorState
              message={getErrorMessage(error)}
              onRetry={() => void refetch()}
            />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: "name",
                header: "User",
                render: (user) => (
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img
                        src={resolveMediaUrl(user.image)}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover border border-amber-500/30 flex-shrink-0"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-extrabold text-stone-950 text-xs shadow-sm flex-shrink-0">
                        {(user.name ?? "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-white text-sm">
                        {user.name ?? "—"}
                      </p>
                      <p className="text-xs text-stone-400">
                        {user.user_name
                          ? `@${user.user_name}`
                          : (user.email ?? "")}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "email",
                header: "Email",
                render: (user) => (
                  <span className="text-xs text-stone-300">
                    {user.email ?? "—"}
                  </span>
                ),
              },
              {
                key: "role",
                header: "Role",
                render: (user) => (
                  <span className="capitalize font-semibold text-amber-400 text-xs">
                    {user.role ?? "User"}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (user) => {
                  const suspended = isUserSuspended(user);
                  return suspended ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[11px] font-bold text-red-400">
                      <ShieldOff className="h-3 w-3" />
                      Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      Active
                    </span>
                  );
                },
              },
              {
                key: "joined",
                header: "Joined",
                render: (user) => (
                  <span className="text-xs text-stone-400">
                    {formatDate(user.createdAt)}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                render: (user) => {
                  const suspended = isUserSuspended(user);
                  return (
                    <Button
                      variant={suspended ? "secondary" : "danger"}
                      size="sm"
                      className={
                        suspended
                          ? "hover:border-emerald-500/50 hover:text-emerald-400"
                          : ""
                      }
                      onClick={() => setPendingUser(user)}
                    >
                      {suspended ? "Activate" : "Suspend"}
                    </Button>
                  );
                },
              },
            ]}
            rows={items}
            rowKey={(user) => user._id}
            isLoading={isFetching}
            empty={
              <EmptyState
                title={
                  searchTerm
                    ? `No users found for "${searchTerm}".`
                    : "No users found."
                }
              />
            }
          />
        )}
        <Pagination
          meta={pagination}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
        />
      </Card>

      <ConfirmDialog
        open={Boolean(pendingUser)}
        title={pendingIsSuspended ? "Activate User" : "Suspend User"}
        description={
          pendingIsSuspended
            ? `Activate "${pendingUser?.name ?? "this user"}"? They will regain full access to the platform.`
            : `Suspend "${pendingUser?.name ?? "this user"}"? They will lose access to the platform until reactivated.`
        }
        confirmLabel={pendingIsSuspended ? "Yes, activate" : "Yes, suspend"}
        loading={isToggling}
        onConfirm={() => void handleToggle()}
        onClose={() => setPendingUser(null)}
      />
    </div>
  );
}
