import { useState } from 'react'
import toast from 'react-hot-toast'
import { CreditCard, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, statusTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/pagination/Pagination'
import { DataTable } from '@/components/table/DataTable'
import { ConfirmDialog } from '@/components/modal/ConfirmDialog'
import { useCancelSubscriptionMutation, useGetSubscribersQuery } from '@/features/subscribers/subscribersApi'
import type { Subscriber } from '@/features/subscribers/types'
import { unwrapList } from '@/utils/list'
import { formatCurrency, formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

export function SubscribersPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const { data, isFetching, isError, error, refetch } = useGetSubscribersQuery({ page, limit })
  const [cancelSubscription, { isLoading }] = useCancelSubscriptionMutation()
  const { items, pagination } = unwrapList<Subscriber>(data)

  const handleCancel = async () => {
    if (!pendingId) return
    try {
      await cancelSubscription(pendingId).unwrap()
      toast.success('Subscription cancelled')
      setPendingId(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscribers"
        description="Manage active platform subscriptions and billing records."
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
                header: 'User',
                render: (item) => (
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-extrabold text-stone-950 text-xs shadow-sm flex-shrink-0">
                      {((item.user?.name ?? 'U').charAt(0)).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-bold text-white text-sm">{item.user?.name ?? '—'}</p>
                      <p className="text-xs text-stone-400">{item.user?.email ?? ''}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'plan',
                header: 'Plan',
                render: (item) => (
                  <span className="font-semibold text-amber-400">{item.name ?? '—'}</span>
                ),
              },
              {
                key: 'price',
                header: 'Price',
                render: (item) => (
                  <div className="flex items-center gap-1.5 text-sm">
                    <CreditCard className="h-3.5 w-3.5 text-stone-400" />
                    <span className="font-extrabold text-white">{formatCurrency(item.price)}</span>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (item) => <Badge tone={statusTone(item.status)}>{item.status ?? 'unknown'}</Badge>,
              },
              {
                key: 'start',
                header: 'Start',
                render: (item) => (
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.startDate)}</span>
                  </div>
                ),
              },
              {
                key: 'end',
                header: 'End',
                render: (item) => (
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.endDate)}</span>
                  </div>
                ),
              },
              {
                key: 'txid',
                header: 'Tx ID',
                render: (item) => (
                  <span className="font-mono text-xs text-stone-500 truncate max-w-[120px] block">{item.txId ?? '—'}</span>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (item) =>
                  item.status === 'active' ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setPendingId(item._id)}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <span className="text-xs text-stone-600">—</span>
                  ),
              },
            ]}
            rows={items}
            rowKey={(item) => item._id}
            isLoading={isFetching}
            empty={<EmptyState title="No subscribers found." />}
          />
        )}
        <Pagination
          meta={pagination}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value)
            setPage(1)
          }}
        />
      </Card>
      <ConfirmDialog
        open={Boolean(pendingId)}
        title="Cancel subscription"
        description="Are you sure you want to cancel this subscription? This action cannot be undone."
        confirmLabel="Yes, cancel"
        loading={isLoading}
        onConfirm={() => void handleCancel()}
        onClose={() => setPendingId(null)}
      />
    </div>
  )
}
