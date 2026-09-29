import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PaginatedSuccess } from '@/types/api'
import type { Video, VideosQuery } from '@/features/videos/types'

export const videosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVideos: builder.query<PaginatedSuccess<Video>, VideosQuery | void>({
      query: (params) => ({
        url: '/videos',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.sort ? { sort: params.sort } : {}),
          ...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((video) => ({ type: 'Video' as const, id: video._id })),
              { type: 'VideoList' as const, id: 'LIST' },
            ]
          : [{ type: 'VideoList' as const, id: 'LIST' }],
    }),
    getVideoById: builder.query<ApiSuccess<Video>, string>({
      query: (id) => `/videos/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Video', id }],
    }),
    toggleVideoFeatured: builder.mutation<ApiSuccess<Video>, string>({
      query: (id) => ({
        url: `/videos/featured/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Video', id },
        { type: 'VideoList', id: 'LIST' },
      ],
    }),
    uploadVideo: builder.mutation<ApiSuccess<Video>, FormData>({
      query: (body) => ({
        url: '/videos',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'VideoList', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetVideosQuery,
  useGetVideoByIdQuery,
  useToggleVideoFeaturedMutation,
  useUploadVideoMutation,
} = videosApi
