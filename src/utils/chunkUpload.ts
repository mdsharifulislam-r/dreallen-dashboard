import { authStorage } from '@/utils/authStorage'

export type ChunkUploadField = 'audio' | 'video'

const CHUNK_SIZE = 2 * 1024 * 1024

const getChunkUploadEndpoint = () => {
  const baseUrl = (import.meta.env.VITE_FILE_BASE_URL as string | undefined) ?? ''
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')
  return normalizedBaseUrl ? `${normalizedBaseUrl}/api/v1/upload/chunk` : '/api/v1/upload/chunk'
}

const parseUploadResponse = async (response: Response) => {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const normalizeUploadedUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  if (trimmed.startsWith('blob:')) {
    return trimmed
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed)
      return parsed.pathname + parsed.search
    } catch {
      return trimmed
    }
  }

  return `/${trimmed.replace(/^\/+/, '')}`
}

export async function uploadMediaWithChunking(
  file: File,
  fieldName: ChunkUploadField,
  onProgress?: (progress: number) => void,
): Promise<string> {
  if (!file) {
    throw new Error(`${fieldName} file is required.`)
  }

  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE))
  let finalUrl = ''

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
    const start = chunkIndex * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)

    const formData = new FormData()
    formData.append('chunk', chunk, file.name)
    formData.append('originalname', file.name)
    formData.append('chunkIndex', String(chunkIndex))
    formData.append('totalChunks', String(totalChunks))

    const token = authStorage.getAccessToken()
    const response = await fetch(getChunkUploadEndpoint(), {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    })

    const payload = await parseUploadResponse(response)

    if (!response.ok) {
      const message =
        typeof payload === 'string'
          ? payload
          : payload?.message ?? payload?.error ?? `Unable to upload ${fieldName} chunk.`
      throw new Error(message)
    }

    const isFinalChunk = chunkIndex === totalChunks - 1
    if (isFinalChunk) {
      const urlCandidate =
        typeof payload === 'string'
          ? payload
          : payload?.url ??
            payload?.data ??
            payload?.publicUrl ??
            payload?.fileUrl ??
            payload?.path ??
            payload?.result ??
            payload?.location

      if (!urlCandidate) {
        throw new Error(`No final URL received for ${fieldName}.`)
      }

      finalUrl = normalizeUploadedUrl(String(urlCandidate)) ?? String(urlCandidate)
    }

    onProgress?.(((chunkIndex + 1) / totalChunks) * 100)
  }

  if (!finalUrl) {
    throw new Error(`No final URL generated for ${fieldName}.`)
  }

  return finalUrl
}
