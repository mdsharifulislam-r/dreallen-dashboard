import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Star, Music, Film, Trash2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { useGetSongsQuery } from "@/features/songs/songsApi";
import { useGetVideosQuery } from "@/features/videos/videosApi";
import {
  useGetRatingsQuery,
  useDeleteRatingMutation,
} from "@/features/ratings/ratingsApi";
import type { Rating } from "@/features/ratings/types";
import { unwrapList } from "@/utils/list";
import { formatDateTime } from "@/utils/format";
import { getErrorMessage } from "@/utils/errors";

type ContentType = "song" | "video";

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < value ? "fill-amber-400 text-amber-400" : "text-stone-700"}`}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-amber-400">{value}/5</span>
    </div>
  );
}

function RatingsList({
  targetId,
  targetTitle,
}: {
  targetId: string;
  targetTitle: string;
  type: ContentType;
}) {
  const { data, isFetching, isError, refetch } = useGetRatingsQuery(targetId);
  const [deleteRating, { isLoading: isDeleting }] = useDeleteRatingMutation();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { items } = unwrapList<Rating>(data);

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteRating(pendingDeleteId).unwrap();
      toast.success("Rating deleted successfully");
      setPendingDeleteId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isError)
    return (
      <div className="px-4 pb-4">
        <ErrorState
          message={`Failed to load reviews for "${targetTitle}"`}
          onRetry={() => void refetch()}
        />
      </div>
    );

  if (isFetching)
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-xl bg-stone-800/50"
          />
        ))}
      </div>
    );

  if (items.length === 0)
    return (
      <div className="px-4 pb-4">
        <EmptyState title="No reviews yet for this content." />
      </div>
    );

  return (
    <>
      <DataTable
        columns={[
          {
            key: "user",
            header: "Reviewer",
            render: (row) => (
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-extrabold text-stone-950 text-xs shrink-0">
                  {(row.userId?.name ?? "U").charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-bold text-white text-sm">
                    {row.userId?.name ?? "—"}
                  </p>
                  <p className="text-xs text-stone-400">
                    {row.userId?.email ?? ""}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "rating",
            header: "Rating",
            render: (row) => <StarDisplay value={row.rating ?? 0} />,
          },
          {
            key: "review",
            header: "Review",
            render: (row) => (
              <p className="text-sm text-stone-300 max-w-xs line-clamp-2">
                {row.review ?? (
                  <span className="text-stone-600">No written review</span>
                )}
              </p>
            ),
          },
          {
            key: "date",
            header: "Date",
            render: (row) => (
              <span className="text-xs text-stone-400">
                {formatDateTime(row.createdAt)}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setPendingDeleteId(row._id)}
                className="gap-1 px-2.5 py-1 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            ),
          },
        ]}
        rows={items}
        rowKey={(row) => row._id}
        isLoading={false}
        empty={<EmptyState title="No reviews." />}
      />

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete Rating & Review"
        description="Are you sure you want to delete this user review? This action cannot be undone."
        confirmLabel="Delete Review"
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setPendingDeleteId(null)}
      />
    </>
  );
}

export function RatingsPage() {
  const [contentType, setContentType] = useState<ContentType>("song");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState("");

  const songsQuery = useGetSongsQuery({ page: 1, limit: 50, sort: "latest" });
  const videosQuery = useGetVideosQuery({ page: 1, limit: 50 });

  const songs = unwrapList(songsQuery.data);
  const videos = unwrapList(videosQuery.data);

  const contentItems = contentType === "song" ? songs.items : videos.items;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ratings & Reviews"
        description="Browse community reviews submitted for songs and videos."
      />

      {/* Backend note */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-400" />
        <div>
          <p className="font-bold text-amber-400">Backend Note</p>
          <p className="text-xs text-amber-300/80 mt-0.5">
            No global admin ratings listing endpoint exists in the API (e.g. GET
            /ratings). Reviews are loaded per content item using{" "}
            <code className="bg-amber-500/20 px-1 rounded">
              GET /ratings/:targetId
            </code>
            . A <strong>delete rating</strong> endpoint also does not exist —
            add{" "}
            <code className="bg-amber-500/20 px-1 rounded">
              DELETE /ratings/:id
            </code>{" "}
            to the backend to enable deletion.
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        {/* Content Selector */}
        <div className="space-y-3">
          {/* Type Tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setContentType("song");
                setSelectedId(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                contentType === "song"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "border-[#29221b] bg-[#120f0d] text-stone-400 hover:border-stone-600 hover:text-stone-200"
              }`}
            >
              <Music className="h-3.5 w-3.5" /> Songs
            </button>
            <button
              type="button"
              onClick={() => {
                setContentType("video");
                setSelectedId(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
                contentType === "video"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "border-[#29221b] bg-[#120f0d] text-stone-400 hover:border-stone-600 hover:text-stone-200"
              }`}
            >
              <Film className="h-3.5 w-3.5" /> Videos
            </button>
          </div>

          {/* Content List */}
          <Card className="bg-[#161310] overflow-hidden max-h-[560px] overflow-y-auto">
            {(
              contentType === "song"
                ? songsQuery.isFetching
                : videosQuery.isFetching
            ) ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-xl bg-stone-800/50"
                  />
                ))}
              </div>
            ) : contentItems.length === 0 ? (
              <EmptyState title={`No ${contentType}s found.`} />
            ) : (
              <ul className="divide-y divide-[#201a15]">
                {(
                  contentItems as Array<{
                    _id: string;
                    title?: string;
                    artist?: string;
                    cover_image?: string;
                  }>
                ).map((item) => (
                  <li key={item._id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(item._id);
                        setSelectedTitle(item.title ?? "");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        selectedId === item._id
                          ? "bg-amber-500/10 border-l-2 border-amber-500"
                          : "hover:bg-[#1a1714] border-l-2 border-transparent"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${contentType === "song" ? "bg-amber-500/10 text-amber-400" : "bg-purple-500/10 text-purple-400"}`}
                      >
                        {contentType === "song" ? (
                          <Music className="h-4 w-4" />
                        ) : (
                          <Film className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">
                          {item.title ?? "—"}
                        </p>
                        <p className="text-xs text-stone-400 truncate">
                          {item.artist ?? ""}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Reviews Panel */}
        <Card className="bg-[#161310]">
          {selectedId ? (
            <>
              <div className="px-5 pt-5 pb-3 border-b border-[#26201a] flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-white text-base">Reviews</h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    "{selectedTitle}"
                  </p>
                </div>
                <Link
                  to={
                    contentType === "song"
                      ? `/admin/songs/${selectedId}/reviews`
                      : `/admin/videos/${selectedId}`
                  }
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="hover:border-amber-500/50 hover:text-amber-400"
                  >
                    Full View
                  </Button>
                </Link>
              </div>
              <RatingsList
                targetId={selectedId}
                targetTitle={selectedTitle}
                type={contentType}
              />
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-stone-500">
              <Star className="h-10 w-10 text-stone-700" />
              <p className="text-sm font-semibold">
                Select a {contentType} to view its reviews
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
