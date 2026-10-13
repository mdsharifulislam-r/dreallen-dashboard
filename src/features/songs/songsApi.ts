import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PaginatedSuccess } from '@/types/api'
import type { Song, SongsQuery } from '@/features/songs/types'

export const songsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSongs: builder.query<PaginatedSuccess<Song>, SongsQuery | void>({
      query: (params) => ({
        url: '/songs',
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
              ...result.data.map((song) => ({ type: 'Song' as const, id: song._id })),
              { type: 'SongList' as const, id: 'LIST' },
            ]
          : [{ type: 'SongList' as const, id: 'LIST' }],
    }),
    getSongById: builder.query<ApiSuccess<Song>, string>({
      query: (id) => `/songs/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Song', id }],
    }),
    uploadSong: builder.mutation<ApiSuccess<Song>, FormData>({
      query: (body) => ({
        url: '/songs',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SongList', id: 'LIST' }],
    }),
    updateSong: builder.mutation<ApiSuccess<Song>, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/songs/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Song', id },
        { type: 'SongList', id: 'LIST' },
      ],
    }),
    deleteSong: builder.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({
        url: `/songs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Song', id },
        { type: 'SongList', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetSongsQuery,
  useGetSongByIdQuery,
  useUploadSongMutation,
  useUpdateSongMutation,
  useDeleteSongMutation,
} = songsApi
