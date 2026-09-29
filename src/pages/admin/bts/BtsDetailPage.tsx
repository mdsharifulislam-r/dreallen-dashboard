import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/modal/ConfirmDialog'
import { useDeleteBtsMutation, useGetBtsByIdQuery } from '@/features/bts/btsApi'
import { formatDateTime } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'
import { resolveMediaUrl } from '@/utils/mediaUrl'

export function BtsDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useGetBtsByIdQuery(id)
  const [deleteBts, { isLoading: isDeleting }] = useDeleteBtsMutation()
  const [confirm, setConfirm] = useState(false)
  const item = data?.data

  const handleDelete = async () => {
    try {
      await deleteBts(id).unwrap()
      toast.success('BTS clip deleted')
      navigate('/admin/bts')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
  if (isLoading || !item) return <div className="h-64 animate-pulse rounded-2xl bg-white" />

  return (
    <div>
      <PageHeader
        title={item.title}
        description={item.description}
        actions={
          <>
            <Link to={`/admin/bts/${item._id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button variant="danger" onClick={() => setConfirm(true)}>
              Delete
            </Button>
          </>
        }
      />
      <Card className="overflow-hidden">
        {item.video ? <video controls className="w-full bg-black" src={resolveMediaUrl(item.video)} /> : null}
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <p className="text-sm text-muted">
            Author: <span className="font-semibold text-ink">{item.author?.name ?? '—'}</span>
          </p>
          <p className="text-sm text-muted">
            Email: <span className="font-semibold text-ink">{item.author?.email ?? '—'}</span>
          </p>
          <p className="text-sm text-muted">
            Created: <span className="font-semibold text-ink">{formatDateTime(item.createdAt)}</span>
          </p>
        </div>
      </Card>
      <ConfirmDialog
        open={confirm}
        title="Delete BTS clip"
        description="This will permanently remove the clip."
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setConfirm(false)}
      />
    </div>
  )
}
