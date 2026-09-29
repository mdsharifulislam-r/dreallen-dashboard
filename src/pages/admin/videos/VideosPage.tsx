import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/search/SearchInput";
import { Pagination } from "@/components/pagination/Pagination";
import { DataTable } from "@/components/table/DataTable";
import {
  useGetVideosQuery,
  useToggleVideoFeaturedMutation,
} from "@/features/videos/videosApi";
import type { Video } from "@/features/videos/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { unwrapList } from "@/utils/list";
import { formatDate, formatNumber } from "@/utils/format";
import { getErrorMessage } from "@/utils/errors";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import type { SortableListQuery } from "@/types/api";

export function VideosPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortableListQuery["sort"]>("latest");
  const searchTerm = useDebouncedValue(search);
  const [toggleFeatured, { isLoading: isToggling }] =
    useToggleVideoFeaturedMutation();

  useEffect(() => {
    setPage(1);
  }, [searchTerm, sort]);

  const { data, isFetching, isError, error, refetch } = useGetVideosQuery({
    page,
    limit,
    sort,
    searchTerm: searchTerm || undefined,
  });
  const { items, pagination } = unwrapList<Video>(data);

  const handleFeatured = async (id: string) => {
    try {
      await toggleFeatured(id).unwrap();
      toast.success("Featured status updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Videos"
        description="Manage video showcase, ratings, and featured items."
        actions={
          <Link to="/admin/videos/upload">
            <Button variant="amber-pill">Upload Video</Button>
          </Link>
        }
      />
      <Card className="bg-[#161310]">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search videos..."
            className="w-full md:max-w-md"
          />
          <Select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as SortableListQuery["sort"])
            }
          >
            <option value="latest">Latest</option>
            <option value="top-rated">Top rated</option>
            <option value="most-played">Most played</option>
          </Select>
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
                key: "title",
                header: "Title",
                render: (video) => (
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveMediaUrl(video.cover_image)}
                      alt=""
                      className="h-11 w-11 rounded-xl object-cover bg-stone-800 border border-[#2b221a]"
                    />
                    <div>
                      <p className="font-bold text-white text-sm hover:text-amber-400 transition-colors">{video.title}</p>
                      <p className="text-xs text-stone-400">{video.artist}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "featured",
                header: "Featured",
                render: (video) => (
                  <Badge tone={video.isFeatured ? "featured" : "neutral"}>
                    {video.isFeatured ? "featured" : "standard"}
                  </Badge>
                ),
              },
              {
                key: "views",
                header: "Views",
                render: (video) => (
                  <div className="flex items-center gap-1.5 text-xs text-stone-300 font-semibold">
                    <Eye className="h-3.5 w-3.5 text-stone-400" />
                    <span>{formatNumber(video.viewsCount)}</span>
                  </div>
                ),
              },
              {
                key: "rating",
                header: "Rating",
                render: (video) => (
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-400">
                      {(video.avgRating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-stone-500">({video.ratingCount ?? 0})</span>
                  </div>
                ),
              },
              {
                key: "released",
                header: "Released",
                render: (video) => <span className="text-stone-400 text-xs">{formatDate(video.releaseDate)}</span>,
              },
              {
                key: "actions",
                header: "Actions",
                render: (video) => (
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/videos/${video._id}`}>
                      <Button variant="secondary" size="sm" className="hover:border-amber-500/50 hover:text-amber-400">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isToggling}
                      onClick={() => void handleFeatured(video._id)}
                      className="hover:text-amber-400"
                    >
                      Toggle featured
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={items}
            rowKey={(video) => video._id}
            isLoading={isFetching}
            empty={
              <EmptyState
                title={
                  searchTerm
                    ? `No videos found for "${searchTerm}".`
                    : "No videos found."
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
    </div>
  );
}
