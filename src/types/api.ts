export interface ApiSuccess<T> {
  success: boolean
  message?: string
  statusCode?: number
  data: T
}

export interface PaginationMeta {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface PaginatedSuccess<T> {
  success: boolean
  message?: string
  statusCode?: number
  data: T[]
  pagination: PaginationMeta
}

export interface ListQuery {
  page?: number
  limit?: number
  searchTerm?: string
}

export interface SortableListQuery extends ListQuery {
  sort?: 'latest' | 'top-rated' | 'most-played'
}

export interface ApiErrorBody {
  success?: boolean
  message?: string
  errorMessages?: Array<{
    path?: string
    message?: string
  }>
}

export interface AuthorRef {
  _id: string
  name?: string
  email?: string
  image?: string
  role?: string
}
