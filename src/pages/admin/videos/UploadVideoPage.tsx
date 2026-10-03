import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Film, Upload, Image as ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { FileField } from '@/components/forms/FileField'
import { PageHeader } from '@/components/ui/PageHeader'
import { useUploadVideoMutation } from '@/features/videos/videosApi'
import { getErrorMessage, getFieldErrors } from '@/utils/errors'
import { uploadMediaWithChunking } from '@/utils/chunkUpload'

export function UploadVideoPage() {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [cover, setCover] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isChunkUploading, setIsChunkUploading] = useState(false)
  const [uploadVideo, { isLoading, error }] = useUploadVideoMutation()
  const fieldErrors = getFieldErrors(error)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!cover || !video) {
      toast.error('Cover image and video file are required.')
      return
    }
    const body = new FormData()
    body.append('title', title)
    body.append('artist', artist)
    body.append('releaseDate', releaseDate)
    body.append('cover_image', cover)

    try {
      setUploadProgress(0)
      setIsChunkUploading(true)
      const uploadedVideoUrl = await uploadMediaWithChunking(video, 'video', setUploadProgress)
      body.append('video', uploadedVideoUrl)

      const result = await uploadVideo(body).unwrap()
      toast.success(result.message ?? 'Video uploaded')
      navigate('/admin/videos')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsChunkUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Video"
        description="Add a new video to the showcase gallery. Supports MP4, MOV, WebM formats."
      />
      <Card className="bg-[#161310] max-w-2xl p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-[#26201a] pb-2">
            Video Info
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Video Title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={fieldErrors.title}
              placeholder="e.g. Top rated Songs"
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
              required
              onChange={setCover}
              error={fieldErrors.cover_image}
              icon={<ImageIcon className="h-5 w-5 text-stone-400" />}
            />
            <FileField
              label="Video File"
              accept="video/*"
              required
              onChange={setVideo}
              error={fieldErrors.video}
              icon={<Film className="h-5 w-5 text-stone-400" />}
            />
          </div>

          {isChunkUploading && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span>Uploading video...</span>
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
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/videos')}>
              Cancel
            </Button>
            <Button type="submit" variant="amber-pill" loading={isLoading || isChunkUploading} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Video
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
