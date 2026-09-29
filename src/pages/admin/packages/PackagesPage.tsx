import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/Card'
import { Badge, statusTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/table/DataTable'
import { ConfirmDialog } from '@/components/modal/ConfirmDialog'
import { useDeletePackageMutation, useGetPackagesQuery } from '@/features/packages/packagesApi'
import type { Package } from '@/features/packages/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

export function PackagesPage() {
  const { data, isFetching, isError, error, refetch } = useGetPackagesQuery()
  const [deletePackage, { isLoading }] = useDeletePackageMutation()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const rows = data?.data ?? []

  const handleDelete = async () => {
    if (!pendingId) return
    try {
      await deletePackage(pendingId).unwrap()
      toast.success('Package deleted')
      setPendingId(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Packages"
        description="Subscription tiers and pricing packages available on the platform."
        actions={
          <Link to="/admin/packages/create">
            <Button variant="amber-pill">Add Package</Button>
          </Link>
        }
      />
      <Card className="bg-[#161310]">
        {isError ? (
          <div className="p-4">
            <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'label', header: 'Label', render: (item) => <span className="font-bold text-white text-sm">{item.label}</span> },
              { key: 'price', header: 'Price', render: (item) => <span className="font-extrabold text-amber-400">{formatCurrency(item.price)}</span> },
              { key: 'recurring', header: 'Billing', render: (item) => <span className="capitalize text-stone-300 font-medium">{item.recurring}</span> },
              {
                key: 'status',
                header: 'Status',
                render: (item) => <Badge tone={statusTone(item.status)}>{item.status ?? 'unknown'}</Badge>,
              },
              {
                key: 'recommended',
                header: 'Recommended',
                render: (item) => (
                  item.recommended ? (
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs px-2.5 py-0.5">Yes</span>
                  ) : (
                    <span className="text-stone-500 text-xs">No</span>
                  )
                ),
              },
              { key: 'created', header: 'Created', render: (item) => formatDate(item.createdAt) },
              {
                key: 'actions',
                header: 'Actions',
                render: (item) => (
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/packages/${item._id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => setPendingId(item._id)}>
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={rows}
            rowKey={(item: Package) => item._id}
            isLoading={isFetching}
            empty={<EmptyState title="No packages found." />}
          />
        )}
      </Card>
      <ConfirmDialog
        open={Boolean(pendingId)}
        title="Delete package"
        description="This package will be permanently removed from the catalog."
        loading={isLoading}
        onConfirm={() => void handleDelete()}
        onClose={() => setPendingId(null)}
      />
    </div>
  )
}
