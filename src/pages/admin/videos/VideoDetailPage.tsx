import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Eye, Play, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/table/DataTable'
import { useGetVideoByIdQuery, useToggleVideoFeaturedMutation } from '@/features/videos/videosApi'
import { useGetRatingsQuery } from '@/features/ratings/ratingsApi'
import type { Rating } from '@/features/ratings/types'
import { unwrapList } from '@/utils/list'
import { formatDate, formatDateTime, formatNumber } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'
import { resolveMediaUrl } from '@/utils/mediaUrl'

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`} />
      ))}
      <span className="ml-1 text-xs font-bold text-amber-400">{rating}/5</span>
    </div>
  )
}

export function VideoDetailPage() {
  const { id = '' } = useParams()
  const { data, isLoading, isError, error, refetch } = useGetVideoByIdQuery(id)
  const ratings = useGetRatingsQuery(id)
  const [toggleFeatured, { isLoading: isToggling }] = useToggleVideoFeaturedMutation()
  const video = data?.data
  const reviewList = unwrapList<Rating>(ratings.data)

  const handleFeatured = async () => {
    try {
      await toggleFeatured(id).unwrap()
      toast.success('Featured status updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
  if (isLoading || !video) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-2xl bg-stone-800/50" />
        <div className="h-64 animate-pulse rounded-2xl bg-stone-800/50" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={video.title}
        description={video.artist}
        actions={
          <div className="flex items-center gap-3">
            <Link to="/admin/videos">
              <Button variant="secondary" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button variant={video.isFeatured ? 'secondary' : 'amber-pill'} loading={isToggling} onClick={() => void handleFeatured()}>
              {video.isFeatured ? 'Unfeature' : '⭐ Mark Featured'}
            </Button>
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Video Player Card */}
        <Card className="bg-[#161310] overflow-hidden">
          {video.video ? (
            <video
              controls
              className="w-full aspect-video bg-black"
              src={resolveMediaUrl(video.video)}
              poster={resolveMediaUrl(video.cover_image)}
            />
          ) : (
            <div className="aspect-video w-full bg-stone-900 flex items-center justify-center">
              <p className="text-stone-500 text-sm">No video source available</p>
            </div>
          )}
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Duration</p>
              <p className="font-mono font-bold text-white">{video.duration ?? '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Released</p>
              <p className="font-bold text-white">{formatDate(video.releaseDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Eye className="h-3 w-3" /> Views
              </p>
              <p className="font-bold text-white">{formatNumber(video.viewsCount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Play className="h-3 w-3" /> Plays
              </p>
              <p className="font-bold text-white">{formatNumber(video.playCount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Star className="h-3 w-3" /> Rating
              </p>
              <p className="font-extrabold text-amber-400">
                {(video.avgRating ?? 0).toFixed(1)} <span className="text-stone-500 font-normal text-xs">({video.ratingCount ?? 0})</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</p>
              <Badge tone={video.isFeatured ? 'featured' : 'neutral'}>{video.isFeatured ? 'featured' : 'standard'}</Badge>
            </div>
          </div>
        </Card>

        {/* Details Sidebar */}
        <Card className="bg-[#161310] p-5 h-fit space-y-4">
          <h2 className="font-bold text-white text-base">Video Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-[#26201a]">
              <dt className="text-stone-500 font-semibold">Type</dt>
              <dd className="font-bold text-stone-200">{video.type ?? 'VIDEO'}</dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#26201a]">
              <dt className="text-stone-500 font-semibold">Created</dt>
              <dd className="font-semibold text-stone-300 text-xs">{formatDateTime(video.createdAt)}</dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#26201a]">
              <dt className="text-stone-500 font-semibold">Updated</dt>
              <dd className="font-semibold text-stone-300 text-xs">{formatDateTime(video.updatedAt)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Reviews Section */}
      <Card className="bg-[#161310]">
        <div className="px-5 pt-5 pb-3 border-b border-[#26201a] flex items-center justify-between">
          <h2 className="font-bold text-white text-base">Community Reviews</h2>
          <span className="text-xs text-stone-400">{reviewList.items.length} reviews</span>
        </div>
        <DataTable
          columns={[
            {
              key: 'user',
              header: 'Listener',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-extrabold text-stone-950 text-xs flex-shrink-0">
                    {((row.userId?.name ?? 'U').charAt(0)).toUpperCase()}
                  </div>
                  <span className="font-bold text-white text-sm">{row.userId?.name ?? '—'}</span>
                </div>
              ),
            },
            {
              key: 'rating',
              header: 'Rating',
              render: (row) => <StarRow rating={row.rating ?? 0} />,
            },
            {
              key: 'review',
              header: 'Review',
              render: (row) => (
                <p className="text-sm text-stone-300 max-w-xs line-clamp-2">{row.review ?? <span className="text-stone-600">—</span>}</p>
              ),
            },
            {
              key: 'date',
              header: 'Date',
              render: (row) => <span className="text-xs text-stone-400">{formatDateTime(row.createdAt)}</span>,
            },
          ]}
          rows={reviewList.items}
          rowKey={(row) => row._id}
          isLoading={ratings.isFetching}
          empty={<EmptyState title="No reviews found." />}
        />
      </Card>
    </div>
  )
}
