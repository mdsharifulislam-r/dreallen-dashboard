import type { ListQuery } from '@/types/api'

export interface SubscriberUser {
  _id: string
  name?: string
  email?: string
}

export interface SubscriberPackage {
  _id: string
  price?: number
}

export interface Subscriber {
  _id: string
  name?: string
  price?: number
  startDate?: string
  endDate?: string
  status?: string
  user?: SubscriberUser
  txId?: string
  package?: SubscriberPackage
  createdAt?: string
  updatedAt?: string
}

export type SubscribersQuery = Pick<ListQuery, 'page' | 'limit'>
