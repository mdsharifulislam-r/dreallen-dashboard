import { useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Star, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/table/DataTable'
import { ConfirmDialog } from '@/components/modal/ConfirmDialog'
import { useGetRatingsQuery, useDeleteRatingMutation } from '@/features/ratings/ratingsApi'
import type { Rating } from '@/features/ratings/types'
import { unwrapList } from '@/utils/list'
import { formatDateTime } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-amber-400">{rating}/5</span>
    </div>
  )
}

export function SongReviewsPage() {
  const { id = '' } = useParams()
  const { data, isFetching, isError, error, refetch } = useGetRatingsQuery(id)
  const [deleteRating, { isLoading: isDeleting }] = useDeleteRatingMutation()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const { items, pagination } = unwrapList<Rating>(data)

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    try {
      await deleteRating(pendingDeleteId).unwrap()
      toast.success('Rating deleted successfully')
      setPendingDeleteId(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Song Reviews"
        description="Community ratings and feedback for this track."
      />
      <Card className="bg-[#161310]">
        {isError ? (
          <div className="p-4">
            <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'user',
                header: 'Listener',
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-extrabold text-stone-950 text-xs shrink-0">
                      {((row.userId?.name ?? row.userId?.email ?? 'U').charAt(0)).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{row.userId?.name ?? '—'}</p>
                      <p className="text-xs text-stone-400">{row.userId?.email ?? ''}</p>
                    </div>
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
                  <p className="text-sm text-stone-300 max-w-xs line-clamp-2">{row.review ?? <span className="text-stone-600">No written review</span>}</p>
                ),
              },
              {
                key: 'date',
                header: 'Date',
                render: (row) => <span className="text-xs text-stone-400">{formatDateTime(row.createdAt)}</span>,
              },
              {
                key: 'actions',
                header: 'Actions',
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
            isLoading={isFetching}
            empty={<EmptyState title="No reviews found for this song." />}
          />
        )}
        {pagination ? (
          <p className="px-5 py-3 text-sm text-stone-500 border-t border-[#26201a]">
            Showing <span className="font-bold text-stone-300">{items.length}</span> of{' '}
            <span className="font-bold text-stone-300">{pagination.total}</span> reviews
          </p>
        ) : null}
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete Review"
        description="Are you sure you want to delete this rating and review? This action cannot be undone."
        confirmLabel="Delete Review"
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setPendingDeleteId(null)}
      />
    </div>
  )
}
