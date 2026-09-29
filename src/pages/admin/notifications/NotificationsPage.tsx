import toast from 'react-hot-toast'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsSeenMutation,
  useMarkNotificationSeenMutation,
} from '@/features/notifications/notificationsApi'
import { formatDateTime } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'

export function NotificationsPage() {
  const { data, isFetching, isError, error, refetch } = useGetNotificationsQuery()
  const [markSeen, { isLoading: isMarking }] = useMarkNotificationSeenMutation()
  const [markAll, { isLoading: isMarkingAll }] = useMarkAllNotificationsSeenMutation()
  const items = data?.data?.data ?? []
  const unread = data?.data?.unreadCount ?? 0

  const handleSeen = async (id: string) => {
    try {
      await markSeen(id).unwrap()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleAll = async () => {
    try {
      await markAll().unwrap()
      toast.success('All notifications marked as seen')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unread} unread notification${unread !== 1 ? 's' : ''}`}
        actions={
          <Button variant="secondary" loading={isMarkingAll} onClick={() => void handleAll()} className="gap-2 hover:border-amber-500/50 hover:text-amber-400">
            <CheckCheck className="h-4 w-4" />
            Mark all seen
          </Button>
        }
      />
      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <Card className="bg-[#161310]">
          {isFetching && items.length === 0 ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-stone-800/50" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState title="No notifications found." />
          ) : (
            <ul className="divide-y divide-[#201a15]">
              {items.map((item) => (
                <li
                  key={item._id}
                  className={`flex items-start justify-between gap-4 px-5 py-4 transition-colors ${
                    !item.isRead ? 'bg-amber-500/5 hover:bg-amber-500/8' : 'hover:bg-[#1a1714]'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${
                      !item.isRead
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        : 'bg-stone-800/50 border-[#26201a] text-stone-500'
                    }`}>
                      {item.isRead ? (
                        <BellOff className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-sm flex items-center gap-2 flex-wrap">
                        {item.title}
                        {!item.isRead ? (
                          <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                            New
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-sm text-stone-400 line-clamp-2">{item.message}</p>
                      <p className="mt-1.5 text-xs text-stone-600">{formatDateTime(item.createdAt)}</p>
                    </div>
                  </div>
                  {!item.isRead ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={isMarking}
                      onClick={() => void handleSeen(item._id)}
                      className="flex-shrink-0 hover:border-amber-500/50 hover:text-amber-400"
                    >
                      Mark seen
                    </Button>
                  ) : (
                    <span className="flex-shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                      Seen
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}
