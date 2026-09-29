import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PaginatedSuccess } from '@/types/api'
import type { SupportStatus, SupportTicket, SupportsQuery } from '@/features/supports/types'

export const supportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupports: builder.query<PaginatedSuccess<SupportTicket>, SupportsQuery | void>({
      query: (params) => ({
        url: '/supports',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((item) => ({ type: 'Support' as const, id: item._id })),
              { type: 'SupportList' as const, id: 'LIST' },
            ]
          : [{ type: 'SupportList' as const, id: 'LIST' }],
    }),
    getSupportById: builder.query<ApiSuccess<SupportTicket>, string>({
      query: (id) => `/supports/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Support', id }],
    }),
    updateSupportStatus: builder.mutation<
      ApiSuccess<SupportTicket>,
      { id: string; status: SupportStatus }
    >({
      query: ({ id, status }) => ({
        url: `/supports/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Support', id },
        { type: 'SupportList', id: 'LIST' },
      ],
    }),
    deleteSupport: builder.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({
        url: `/supports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'SupportList', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetSupportsQuery,
  useGetSupportByIdQuery,
  useUpdateSupportStatusMutation,
  useDeleteSupportMutation,
} = supportsApi
