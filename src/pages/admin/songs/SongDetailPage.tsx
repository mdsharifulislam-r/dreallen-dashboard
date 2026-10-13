import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/modal/ConfirmDialog'
import { useDeleteSongMutation, useGetSongByIdQuery } from '@/features/songs/songsApi'
import { formatDate, formatDateTime } from '@/utils/format'
import { getErrorMessage } from '@/utils/errors'
import { resolveMediaUrl } from '@/utils/mediaUrl'

export function SongDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useGetSongByIdQuery(id)
  const [deleteSong, { isLoading: isDeleting }] = useDeleteSongMutation()
  const [confirm, setConfirm] = useState(false)
  const song = data?.data

  const handleDelete = async () => {
    try {
      await deleteSong(id).unwrap()
      toast.success('Song deleted successfully')
      navigate('/admin/songs')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
  }
  if (isLoading || !song) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={song.title}
        description={song.artist}
        actions={
          <>
            <Link to={`/admin/songs/${song._id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button variant="danger" onClick={() => setConfirm(true)}>
              Delete
            </Button>
          </>
        }
      />
      <Card className="overflow-hidden bg-[#161310]">
        <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,240px)_1fr]">
          {song.cover_image ? (
            <img
              src={resolveMediaUrl(song.cover_image)}
              alt={`${song.title} cover`}
              className="aspect-square w-full rounded-xl object-cover"
            />
          ) : null}
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <p className="text-sm text-stone-400">
                Artist: <span className="font-semibold text-white">{song.artist}</span>
              </p>
              <p className="text-sm text-stone-400">
                Release date: <span className="font-semibold text-white">{formatDate(song.releaseDate)}</span>
              </p>
              <p className="text-sm text-stone-400">
                Duration: <span className="font-semibold text-white">{song.duration ?? '—'}</span>
              </p>
              <p className="text-sm text-stone-400">
                Plays: <span className="font-semibold text-white">{song.playCount ?? song.viewsCount ?? 0}</span>
              </p>
              <p className="text-sm text-stone-400">
                Added: <span className="font-semibold text-white">{formatDateTime(song.createdAt)}</span>
              </p>
            </div>
            {song.audio ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-stone-300">Audio preview</p>
                <audio controls className="w-full" src={resolveMediaUrl(song.audio)} />
              </div>
            ) : null}
          </div>
        </div>
      </Card>
      <ConfirmDialog
        open={confirm}
        title="Delete song"
        description="This will permanently remove the song from the catalog. This action cannot be undone."
        confirmLabel="Delete Song"
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setConfirm(false)}
      />
    </div>
  )
}
