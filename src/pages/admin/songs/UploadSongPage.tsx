import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Music, Upload, Image as ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { FileField } from '@/components/forms/FileField'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  useGetSongByIdQuery,
  useUpdateSongMutation,
  useUploadSongMutation,
} from '@/features/songs/songsApi'
import { getErrorMessage, getFieldErrors } from '@/utils/errors'
import { uploadMediaWithChunking } from '@/utils/chunkUpload'
import { ErrorState } from '@/components/ui/ErrorState'
import { resolveMediaUrl } from '@/utils/mediaUrl'

export function UploadSongPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [cover, setCover] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isChunkUploading, setIsChunkUploading] = useState(false)
  const [uploadSong, { isLoading, error }] = useUploadSongMutation()
  const [updateSong, updateState] = useUpdateSongMutation()
  const existing = useGetSongByIdQuery(id ?? '', { skip: !id })
  const fieldErrors = getFieldErrors(error ?? updateState.error)
  const navigate = useNavigate()

  useEffect(() => {
    if (existing.data?.data) {
      setTitle(existing.data.data.title)
      setArtist(existing.data.data.artist)
      setReleaseDate(existing.data.data.releaseDate?.slice(0, 10) ?? '')
    }
  }, [existing.data])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!isEdit && (!cover || !audio)) {
      toast.error('Cover image and audio file are required.')
      return
    }

    const body = new FormData()
    body.append('title', title)
    body.append('artist', artist)
    body.append('releaseDate', releaseDate)
    if (cover) body.append('cover_image', cover)

    try {
      if (audio) {
        setUploadProgress(0)
        setIsChunkUploading(true)
        const uploadedAudioUrl = await uploadMediaWithChunking(audio, 'audio', setUploadProgress)
        body.append('audio', uploadedAudioUrl)
      }

      if (isEdit && id) {
        const result = await updateSong({ id, body }).unwrap()
        toast.success(result.message ?? 'Song updated')
      } else {
        const result = await uploadSong(body).unwrap()
        toast.success(result.message ?? 'Song uploaded')
      }
      navigate('/admin/songs')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsChunkUploading(false)
    }
  }

  if (isEdit && existing.isError) {
    return <ErrorState message={getErrorMessage(existing.error)} onRetry={() => void existing.refetch()} />
  }

  if (isEdit && (existing.isLoading || !existing.data?.data)) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Song' : 'Upload Song'}
        description={isEdit ? 'Update track details or replace its media files.' : 'Add a new track to the music catalog. Supports MP3, WAV, AAC formats.'}
      />
      <Card className="bg-[#161310] max-w-2xl p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-[#26201a] pb-2">
            Track Info
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Song Title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={fieldErrors.title}
              placeholder="e.g. Midnight Drive"
            />
            <FormField
              label="Artist Name"
              required
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              error={fieldErrors.artist}
              placeholder="e.g. Dre Allen"
            />
          </div>
          <FormField
            label="Release Date"
            type="date"
            required
            value={releaseDate}
            onChange={(event) => setReleaseDate(event.target.value)}
            error={fieldErrors.releaseDate}
          />

          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-[#26201a] pb-2 pt-2">
            Media Files
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FileField
              label="Cover Image"
              accept="image/*"
              required={!isEdit}
              onChange={setCover}
              error={fieldErrors.cover_image}
              preview={cover ? undefined : resolveMediaUrl(existing.data?.data.cover_image)}
              hint={isEdit ? 'Leave empty to keep the current cover image.' : undefined}
              icon={<ImageIcon className="h-5 w-5 text-stone-400" />}
            />
            <FileField
              label="Audio File"
              accept="audio/*"
              required={!isEdit}
              onChange={setAudio}
              error={fieldErrors.audio}
              hint={isEdit ? 'Leave empty to keep the current audio file.' : undefined}
              icon={<Music className="h-5 w-5 text-stone-400" />}
            />
          </div>

          {isChunkUploading && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span>Uploading audio...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#201b18]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-[#26201a]">
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/songs')}>
              Cancel
            </Button>
            <Button type="submit" variant="amber-pill" loading={isLoading || updateState.isLoading || isChunkUploading} className="gap-2">
              <Upload className="h-4 w-4" />
              {isEdit ? 'Save Changes' : 'Upload Song'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
