import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PaginatedSuccess } from '@/types/api'
import type { BtsItem, BtsQuery } from '@/features/bts/types'

export const btsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBtsList: builder.query<PaginatedSuccess<BtsItem>, BtsQuery>({
      query: (params) => ({
        url: '/bts',
        params: {
          ...(params?.page ? { page: params.page } : {}),
          ...(params?.limit ? { limit: params.limit } : {}),
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
            ...result.data.map((item) => ({ type: 'Bts' as const, id: item._id })),
            { type: 'BtsList' as const, id: 'LIST' },
          ]
          : [{ type: 'BtsList' as const, id: 'LIST' }],
    }),
    getBtsById: builder.query<ApiSuccess<BtsItem>, string>({
      query: (id) => `/bts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Bts', id }],
    }),
    createBts: builder.mutation<ApiSuccess<BtsItem>, FormData>({
      query: (body) => ({
        url: '/bts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'BtsList', id: 'LIST' }],
    }),
    updateBts: builder.mutation<ApiSuccess<BtsItem>, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/bts/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Bts', id },
        { type: 'BtsList', id: 'LIST' },
      ],
    }),
    deleteBts: builder.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({
        url: `/bts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Bts', id },
        { type: 'BtsList', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetBtsListQuery,
  useGetBtsByIdQuery,
  useCreateBtsMutation,
  useUpdateBtsMutation,
  useDeleteBtsMutation,
} = btsApi
