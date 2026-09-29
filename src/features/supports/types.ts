import type { AuthorRef, ListQuery } from '@/types/api'

export type SupportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export interface SupportTicket {
  _id: string
  name?: string
  email?: string
  subject?: string
  feedback?: string
  userId?: AuthorRef
  status?: SupportStatus | string
  createdAt?: string
  updatedAt?: string
}

export type SupportsQuery = Pick<ListQuery, 'page' | 'limit'>
