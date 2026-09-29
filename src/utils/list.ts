import type { PaginationMeta } from '@/types/api'

const emptyPagination: PaginationMeta = {
  total: 0,
  limit: 10,
  page: 1,
  totalPage: 1,
}

export function unwrapList<T>(response: unknown): { items: T[]; pagination?: PaginationMeta } {
  if (!response || typeof response !== 'object') {
    return { items: [], pagination: emptyPagination }
  }

  const root = response as Record<string, unknown>
  const pagination = (root.pagination as PaginationMeta | undefined) ?? emptyPagination

  if (Array.isArray(root.data)) {
    return { items: root.data as T[], pagination }
  }

  const nested = root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : null
  if (nested) {
    const candidate =
      (Array.isArray(nested.data) && nested.data) ||
      (Array.isArray(nested.users) && nested.users) ||
      (Array.isArray(nested.results) && nested.results)
    if (candidate) {
      return {
        items: candidate as T[],
        pagination: (nested.pagination as PaginationMeta | undefined) ?? pagination,
      }
    }
  }

  return { items: [], pagination }
}
