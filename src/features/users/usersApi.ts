import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PaginatedSuccess } from '@/types/api'
import type {
  UserRecord,
  UserStatistics,
  UserGrowthResponse,
  EarningResponse,
} from '@/features/users/types'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedSuccess<UserRecord>, any | void>({
      query: (params) => ({
        url: '/user',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
          ...(params?.fields ? { fields: params.fields } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
            ...result.data.map((user) => ({ type: 'User' as const, id: user._id })),
            { type: 'UserList' as const, id: 'LIST' },
          ]
          : [{ type: 'UserList' as const, id: 'LIST' }],
    }),

    // POST /user/status/toggle-profile-status/:userId
    toggleUserStatus: builder.mutation<ApiSuccess<UserRecord>, string>({
      query: (userId) => ({
        url: `/user/status/toggle-profile-status/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'User', id: userId },
        { type: 'UserList', id: 'LIST' },
      ],
    }),

    // GET /user/statistics
    getUserStatistics: builder.query<ApiSuccess<UserStatistics>, void>({
      query: () => '/user/statistics',
      providesTags: ['UserList'],
    }),

    // GET /user/user-statistics?year=YYYY
    getUserGrowth: builder.query<ApiSuccess<UserGrowthResponse>, number>({
      query: (year) => ({ url: '/user/user-statistics', params: { year } }),
    }),

    // GET /user/user-earning?year=YYYY
    getUserEarning: builder.query<ApiSuccess<EarningResponse>, number>({
      query: (year) => ({ url: '/user/user-earning', params: { year } }),
    }),
  }),
})

export const {
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useGetUserStatisticsQuery,
  useGetUserGrowthQuery,
  useGetUserEarningQuery,
} = usersApi
