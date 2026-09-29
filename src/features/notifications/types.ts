import type { PaginationMeta } from '@/types/api'

export interface NotificationItem {
  _id: string
  title?: string
  receiver?: string[]
  message?: string
  filePath?: string
  isRead?: boolean
  readers?: string[]
  referenceId?: string
  createdAt?: string
  updatedAt?: string
}

export interface NotificationPayload {
  unreadCount: number
  data: NotificationItem[]
}

export interface NotificationResponse {
  success: boolean
  message?: string
  pagination?: PaginationMeta
  data: NotificationPayload
}
