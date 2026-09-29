import type { AuthorRef } from '@/types/api'

export interface Rating {
  _id: string
  userId?: AuthorRef
  targetId?: string
  rating?: number
  review?: string
  createdAt?: string
  updatedAt?: string
}
