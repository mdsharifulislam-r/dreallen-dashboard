import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'
import type { ApiErrorBody } from '@/types/api'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!isRecord(error)) return fallback

  if ('status' in error) {
    const status = error.status
    const data = error.data
    if (typeof data === 'string' && data.trim()) return data
    if (isRecord(data) && typeof data.message === 'string') return data.message

    if (status === 401) return 'Your session has expired. Please sign in again.'
    if (status === 403) return 'You do not have permission to perform this action.'
    if (status === 404) return 'The requested record was not found.'
    if (status === 422) return 'Please review the form and fix the highlighted fields.'
    if (status === 429) return 'Too many requests. Please wait a moment and try again.'
    if (typeof status === 'number' && status >= 500) {
      return 'The server is unavailable right now. Please try again later.'
    }
  }

  if (typeof error.message === 'string' && error.message) return error.message
  return fallback
}

export function getFieldErrors(
  error: FetchBaseQueryError | SerializedError | unknown,
): Record<string, string> {
  if (!isRecord(error) || !isRecord(error.data)) return {}
  const data = error.data as ApiErrorBody
  const messages = data.errorMessages
  if (!messages?.length) return {}

  return messages.reduce<Record<string, string>>((acc, item) => {
    if (item.path && item.message) acc[item.path] = item.message
    return acc
  }, {})
}
