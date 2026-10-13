import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LayoutGrid, List, Plus, Video as VideoIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/search/SearchInput";
import { Pagination } from "@/components/pagination/Pagination";
import { DataTable } from "@/components/table/DataTable";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import {
  useDeleteBtsMutation,
  useGetBtsListQuery,
} from "@/features/bts/btsApi";
import type { BtsItem } from "@/features/bts/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { unwrapList } from "@/utils/list";
import { formatDate, getImageUrl } from "@/utils/format";
import { getErrorMessage } from "@/utils/errors";

export function BtsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [featuredStates, setFeaturedStates] = useState<Record<string, boolean>>(
    {},
  );
  const [publishedStates, setPublishedStates] = useState<
    Record<string, boolean>
  >({});

  const searchTerm = useDebouncedValue(search);
  const [deleteBts, { isLoading: isDeleting }] = useDeleteBtsMutation();

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const { data, isFetching, isError, error, refetch } = useGetBtsListQuery({
    page,
    limit,
    searchTerm: searchTerm || undefined,
  });
  const { items, pagination } = unwrapList<BtsItem>(data);

  const handleDelete = async () => {
    if (!pendingId) return;
    try {
      await deleteBts(pendingId).unwrap();
      toast.success("BTS clip deleted successfully");
      setPendingId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleFeaturedState = (id: string) => {
    setFeaturedStates((prev) => {
      const next = !prev[id];
      toast.success(next ? "Marked as Featured" : "Removed from Featured");
      return { ...prev, [id]: next };
    });
  };

  const togglePublishState = (id: string) => {
    setPublishedStates((prev) => {
      const next = !prev[id];
      toast.success(next ? "Clip published" : "Clip unpublished");
      return { ...prev, [id]: next };
    });
  };

  const combinedItems = items.map((item) => ({
    _id: item._id,
    title: item.title,
    description: item.description || "",
    uploadedAt: formatDate(item.createdAt),
    isFeatured: featuredStates[item._id] ?? false,
    isPublished: publishedStates[item._id] ?? Boolean(item.author),
    thumbnail: item.thumbnail || item.image,
  }));

  const filteredItems = searchTerm
    ? combinedItems.filter(
        (i) =>
          i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : combinedItems;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Behind The Scenes"
        actions={
          <Link to="/admin/bts/create">
            <Button variant="amber-pill" className="gap-2 px-5 py-2.5">
              <Plus className="h-4 w-4" />
              Upload BTS Video
            </Button>
          </Link>
        }
      />

      {/* Control Bar (Search + View Mode Toggle) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search BTS videos..."
          className="w-full sm:max-w-md"
        />
        <div className="flex items-center gap-1 rounded-xl border border-[#29221b] bg-[#161310] p-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "grid"
                ? "bg-amber-500 text-stone-950 font-bold"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === "table"
                ? "bg-amber-500 text-stone-950 font-bold"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Table
          </button>
        </div>
      </div>

      {isError ? (
        <ErrorState
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      ) : viewMode === "grid" ? (
        /* Video card grid view */
        filteredItems.length === 0 ? (
          isFetching ? null : (
            <EmptyState
              title={
                searchTerm
                  ? `No BTS found for "${searchTerm}".`
                  : "No BTS clips found."
              }
            />
          )
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <Card
                key={item._id}
                className="flex flex-col justify-between overflow-hidden bg-[#161310] border-[#26201a] hover:border-amber-500/30 transition-all duration-300 group shadow-xl"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-stone-900">
                    {item.thumbnail ? (
                      <img
                        src={getImageUrl(item.thumbnail)}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                      {item.isFeatured ? (
                        <span className="rounded-full bg-amber-500/20 border border-amber-500/50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 shadow-sm backdrop-blur-md">
                          FEATURED
                        </span>
                      ) : null}
                    </div>

                    <div className="absolute bottom-3 left-3">
                      {item.isPublished ? (
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 backdrop-blur-md">
                          Published
                        </span>
                      ) : (
                        <span className="rounded-full bg-stone-800/80 border border-stone-700/60 px-2.5 py-0.5 text-xs font-semibold text-stone-400 backdrop-blur-md">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-base text-white hover:text-amber-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.uploadedAt ? (
                      <div className="pt-2 text-xs font-medium text-stone-400">
                        Uploaded {item.uploadedAt}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-[#231d18] bg-[#120f0d] px-4 py-3">
                  <ToggleSwitch
                    label="Featured"
                    checked={item.isFeatured}
                    onChange={() => toggleFeaturedState(item._id)}
                  />

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => togglePublishState(item._id)}
                      className="rounded-lg border border-[#382d24] bg-[#221b16] px-3 py-1.5 text-xs font-semibold text-stone-300 hover:bg-[#2b221c] hover:text-white transition"
                    >
                      {item.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <Link to={`/admin/bts/${item._id}/edit`}>
                      <button
                        type="button"
                        className="rounded-lg border border-[#382d24] bg-[#221b16] px-3 py-1.5 text-xs font-semibold text-stone-300 hover:bg-[#2b221c] hover:text-white transition"
                      >
                        Edit
                      </button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingId(item._id)}
                      className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/50 hover:text-red-300 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Data table view */
        <Card className="bg-[#161310]">
          <DataTable
            columns={[
              {
                key: "title",
                header: "Title",
                render: (item) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <VideoIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        {item.title}
                      </span>
                      <span className="text-xs text-stone-400">
                        {item.description}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (item) => (
                  <Badge tone={item.author ? "success" : "warning"}>
                    {item.author ? "published" : "draft"}
                  </Badge>
                ),
              },
              {
                key: "created",
                header: "Created",
                render: (item) => formatDate(item.createdAt),
              },
              {
                key: "actions",
                header: "Actions",
                render: (item) => (
                  <div className="flex gap-2">
                    <Link to={`/admin/bts/${item._id}`}>
                      <Button variant="secondary" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link to={`/admin/bts/${item._id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setPendingId(item._id)}
                    >
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={items}
            rowKey={(item) => item._id}
            isLoading={isFetching}
            empty={
              <EmptyState
                title={
                  searchTerm
                    ? `No BTS found for "${searchTerm}".`
                    : "No BTS clips found."
                }
              />
            }
          />
          <Pagination
            meta={pagination}
            onPageChange={setPage}
            onLimitChange={(value) => {
              setLimit(value);
              setPage(1);
            }}
          />
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(pendingId)}
        title="Delete BTS clip"
        description="This will permanently remove the clip from the collection. This action cannot be undone."
        confirmLabel="Delete Clip"
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setPendingId(null)}
      />
    </div>
  );
}
