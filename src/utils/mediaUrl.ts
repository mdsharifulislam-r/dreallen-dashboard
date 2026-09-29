const fileBaseUrl = (import.meta.env.VITE_FILE_BASE_URL as string | undefined) ?? ''

export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path
  }
  const origin = fileBaseUrl.replace(/\/+$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${origin}${normalized}`
}
