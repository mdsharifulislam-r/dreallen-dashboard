import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PaginatedSuccess } from '@/types/api'
import type { Rating } from '@/features/ratings/types'

export const ratingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRatings: builder.query<PaginatedSuccess<Rating>, string>({
      query: (targetId) => `/ratings/${targetId}`,
      providesTags: (_result, _error, targetId) => [{ type: 'Rating', id: targetId }],
    }),

    deleteRating: builder.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({
        url: `/ratings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rating'],
    }),
  }),
})

export const { useGetRatingsQuery, useDeleteRatingMutation } = ratingsApi

