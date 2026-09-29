import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Clock, User } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, statusTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/modal/ConfirmDialog'
import {
  useDeleteSupportMutation,
  useGetSupportByIdQuery,
  useUpdateSupportStatusMutation,
} from '@/features/supports/supportsApi'
import type { SupportStatus } from '@/features/supports/types'
import { formatDateTime } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

const statuses: SupportStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const statusColors: Record<string, string> = {
  PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  IN_PROGRESS: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  RESOLVED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  CLOSED: 'text-stone-400 bg-stone-500/10 border-stone-500/30',
}

export function SupportDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useGetSupportByIdQuery(id)
  const [updateStatus, { isLoading: isUpdating }] = useUpdateSupportStatusMutation()
  const [deleteSupport, { isLoading: isDeleting }] = useDeleteSupportMutation()
  const [status, setStatus] = useState<SupportStatus>('PENDING')
  const [confirm, setConfirm] = useState(false)
  const ticket = data?.data

  useEffect(() => {
    if (ticket?.status) {
      setStatus(ticket.status as SupportStatus)
    }
  }, [ticket?.status])

  const handleStatus = async () => {
    try {
      const result = await updateStatus({ id, status }).unwrap()
      toast.success(result.message ?? 'Status updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    try {
      await deleteSupport(id).unwrap()
      toast.success('Support ticket deleted')
      navigate('/admin/supports')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
  if (isLoading || !ticket) return (
    <div className="space-y-4">
      <div className="h-12 animate-pulse rounded-2xl bg-stone-800/50" />
      <div className="h-64 animate-pulse rounded-2xl bg-stone-800/50" />
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.subject ?? 'Support ticket'}
        description={ticket.email}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/admin/supports')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button variant="danger" onClick={() => setConfirm(true)}>
              Delete
            </Button>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Ticket Detail Card */}
        <Card className="bg-[#161310] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <Badge tone={statusTone(ticket.status)}>{ticket.status ?? 'unknown'}</Badge>
            <span className="text-xs text-stone-500">{formatDateTime(ticket.createdAt)}</span>
          </div>

          <div className="rounded-xl border border-[#26201a] bg-[#120f0d] p-4">
            <p className="text-sm leading-7 text-stone-300 whitespace-pre-wrap">
              {ticket.feedback ?? 'No content provided.'}
            </p>
          </div>

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-1 rounded-xl border border-[#26201a] bg-[#120f0d] p-3">
              <dt className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <User className="h-3 w-3" />
                Submitted by
              </dt>
              <dd className="font-bold text-white">{ticket.name}</dd>
              <dd className="text-xs text-stone-400">{ticket.email}</dd>
            </div>
            <div className="space-y-1 rounded-xl border border-[#26201a] bg-[#120f0d] p-3">
              <dt className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <User className="h-3 w-3" />
                Linked Account
              </dt>
              <dd className="font-bold text-white">{ticket.userId?.name ?? '—'}</dd>
              <dd className="text-xs text-stone-400">{ticket.userId?.email ?? '—'}</dd>
            </div>
            <div className="space-y-1 rounded-xl border border-[#26201a] bg-[#120f0d] p-3">
              <dt className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <Clock className="h-3 w-3" />
                Created
              </dt>
              <dd className="font-semibold text-stone-200">{formatDateTime(ticket.createdAt)}</dd>
            </div>
            <div className="space-y-1 rounded-xl border border-[#26201a] bg-[#120f0d] p-3">
              <dt className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <Clock className="h-3 w-3" />
                Last Updated
              </dt>
              <dd className="font-semibold text-stone-200">{formatDateTime(ticket.updatedAt)}</dd>
            </div>
          </dl>
        </Card>

        {/* Status Update Card */}
        <Card className="bg-[#161310] p-6 space-y-4 h-fit">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Update Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                  status === s
                    ? statusColors[s] ?? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'border-[#29221b] bg-[#120f0d] text-stone-400 hover:border-stone-600 hover:text-stone-200'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <Button className="w-full" variant="amber-pill" loading={isUpdating} onClick={() => void handleStatus()}>
            Save Status
          </Button>

          <div className="border-t border-[#26201a] pt-4">
            <p className="text-xs text-stone-500 mb-3">Current status</p>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as SupportStatus)}
              className="w-full"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>{item.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>
        </Card>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Delete support ticket"
        description="This ticket will be permanently removed."
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setConfirm(false)}
      />
    </div>
  )
}
