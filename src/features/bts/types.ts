import type { AuthorRef, ListQuery } from '@/types/api'

export interface BtsItem {
  _id: string
  title: string
  description?: string
  video?: string
  thumbnail?: string
  image?: string
  author?: AuthorRef
  createdAt?: string
  updatedAt?: string
}

export type BtsQuery = ListQuery
