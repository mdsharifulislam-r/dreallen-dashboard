function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

/**
 * Login has no example response in Postman. This helper only reads common
 * token field names if they appear. It does not invent an endpoint.
 */
export function extractAccessToken(payload: unknown): string | null {
  const direct = readString(payload)
  if (direct) return direct

  const root = asRecord(payload)
  if (!root) return null

  const nested = asRecord(root.data) ?? root
  return (
    readString(nested.accessToken) ??
    readString(nested.access_token) ??
    readString(nested.token) ??
    readString(root.accessToken) ??
    readString(root.access_token) ??
    readString(root.token)
  )
}

export function extractUserPayload(payload: unknown): Record<string, unknown> | null {
  const root = asRecord(payload)
  if (!root) return null
  const nested = asRecord(root.data) ?? root
  const user = asRecord(nested.user) ?? asRecord(root.user)
  return user
}
