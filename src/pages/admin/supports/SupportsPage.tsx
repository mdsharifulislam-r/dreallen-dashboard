import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, statusTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/pagination/Pagination'
import { DataTable } from '@/components/table/DataTable'
import { ConfirmDialog } from '@/components/modal/ConfirmDialog'
import { useDeleteSupportMutation, useGetSupportsQuery } from '@/features/supports/supportsApi'
import type { SupportTicket } from '@/features/supports/types'
import { unwrapList } from '@/utils/list'
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

export function SupportsPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const { data, isFetching, isError, error, refetch } = useGetSupportsQuery({ page, limit })
  const [deleteSupport, { isLoading }] = useDeleteSupportMutation()
  const { items, pagination } = unwrapList<SupportTicket>(data)

  const handleDelete = async () => {
    if (!pendingId) return
    try {
      await deleteSupport(pendingId).unwrap()
      toast.success('Support ticket deleted')
      setPendingId(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" description="Review and manage user-submitted support requests." />
      <Card className="bg-[#161310]">
        {isError ? (
          <div className="p-4">
            <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'subject',
                header: 'Subject',
                render: (item) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block">{item.subject}</span>
                      <span className="text-xs text-stone-400">{item.name ?? item.userId?.name ?? '—'}</span>
                    </div>
                  </div>
                ),
              },
              {
                key: 'email',
                header: 'Email',
                render: (item) => (
                  <span className="text-xs text-stone-300">{item.email ?? item.userId?.email ?? '—'}</span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (item) => <Badge tone={statusTone(item.status)}>{item.status ?? 'unknown'}</Badge>,
              },
              {
                key: 'created',
                header: 'Created',
                render: (item) => <span className="text-xs text-stone-400">{formatDate(item.createdAt)}</span>,
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (item) => (
                  <div className="flex gap-2">
                    <Link to={`/admin/supports/${item._id}`}>
                      <Button variant="secondary" size="sm" className="hover:border-amber-500/50 hover:text-amber-400">
                        View
                      </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => setPendingId(item._id)}>
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={items}
            rowKey={(item) => item._id}
            isLoading={isFetching}
            empty={<EmptyState title="No support tickets found." />}
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
        title="Delete support ticket"
        description="This ticket will be permanently removed. This action cannot be undone."
        loading={isLoading}
        onConfirm={() => void handleDelete()}
        onClose={() => setPendingId(null)}
      />
    </div>
  )
}
