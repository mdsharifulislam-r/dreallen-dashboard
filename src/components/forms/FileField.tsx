import { useRef, useState, type ReactNode } from 'react'
import { Upload } from 'lucide-react'

interface FileFieldProps {
  label: string
  accept: string
  required?: boolean
  hint?: string
  error?: string
  preview?: string
  icon?: ReactNode
  onChange: (file: File | null) => void
}

export function FileField({
  label,
  accept,
  required,
  hint,
  error,
  preview,
  icon,
  onChange,
}: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const hasFile = Boolean(name)

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-stone-300">{label}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`group flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-5 text-center transition-all ${
          hasFile
            ? 'border-amber-500/50 bg-amber-500/5 text-amber-400'
            : error
            ? 'border-red-500/50 bg-red-950/10 text-stone-400 hover:border-red-400/70'
            : 'border-[#29221b] bg-[#120f0d] text-stone-500 hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-stone-300'
        }`}
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
          hasFile ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-500 group-hover:bg-amber-500/10 group-hover:text-amber-400'
        }`}>
          {icon ?? <Upload className="h-5 w-5" />}
        </div>
        <div>
          {hasFile ? (
            <p className="text-sm font-semibold text-amber-400 truncate max-w-[180px]">{name}</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-stone-300">Click to browse</p>
              <p className="text-xs text-stone-600 mt-0.5">{accept.replace(/\*\/\*/g, 'all files').replace('image/*', 'PNG, JPG, WebP').replace('audio/*', 'MP3, WAV, AAC').replace('video/*', 'MP4, MOV, WebM')}</p>
            </>
          )}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        required={required}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          setName(file?.name ?? '')
          onChange(file)
        }}
      />
      {preview ? (
        preview.match(/\.(mp3|mp4|wav|webm)$/i) || preview.startsWith('blob:') ? (
          <p className="text-xs text-stone-400">Selected file ready to upload.</p>
        ) : (
          <img src={preview} alt="" className="mt-2 h-20 w-20 rounded-xl object-cover border border-[#26201a]" />
        )
      ) : null}
      {hint && !error ? <p className="text-xs text-stone-500">{hint}</p> : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
}
