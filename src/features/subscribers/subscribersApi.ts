import { baseApi } from '@/services/baseApi'
import type { PaginatedSuccess } from '@/types/api'
import type { Subscriber, SubscribersQuery } from '@/features/subscribers/types'

export const subscribersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscribers: builder.query<PaginatedSuccess<Subscriber>, SubscribersQuery | void>({
      query: (params) => ({
        url: '/subscription/subscribed-users',
        params: {
          ...(params?.page ? { page: params.page } : {}),
          ...(params?.limit ? { limit: params.limit } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((item) => ({ type: 'Subscriber' as const, id: item._id })),
              { type: 'SubscriberList' as const, id: 'LIST' },
            ]
          : [{ type: 'SubscriberList' as const, id: 'LIST' }],
    }),
    cancelSubscription: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/subscription/cancel/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'SubscriberList', id: 'LIST' }, 'Notification'],
    }),
  }),
})

export const { useGetSubscribersQuery, useCancelSubscriptionMutation } = subscribersApi
