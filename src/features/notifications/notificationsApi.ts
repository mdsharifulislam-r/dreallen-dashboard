import { baseApi } from '@/services/baseApi'
import type { ApiSuccess } from '@/types/api'
import type { NotificationResponse } from '@/features/notifications/types'

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationResponse, void>({
      query: () => '/notification',
      providesTags: ['Notification'],
    }),
    markNotificationSeen: builder.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({
        url: `/notification/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsSeen: builder.mutation<ApiSuccess<unknown>, void>({
      query: () => ({
        url: '/notification',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useMarkNotificationSeenMutation,
  useMarkAllNotificationsSeenMutation,
} = notificationsApi
