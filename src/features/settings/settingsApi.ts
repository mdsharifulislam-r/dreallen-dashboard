import { baseApi } from '@/services/baseApi'
import type { ApiSuccess } from '@/types/api'
import type { SettingContent, SettingKey } from '@/features/settings/types'

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSetting: builder.query<ApiSuccess<SettingContent>, SettingKey>({
      query: (key) => `/settings/${key}`,
      providesTags: (_result, _error, key) => [{ type: 'Setting', id: key }],
    }),
    updateSetting: builder.mutation<
      ApiSuccess<SettingContent>,
      { key: SettingKey; description: string }
    >({
      query: ({ key, description }) => ({
        url: `/settings/${key}`,
        method: 'POST',
        body: { description },
      }),
      invalidatesTags: (_result, _error, { key }) => [{ type: 'Setting', id: key }],
    }),
  }),
})

export const { useGetSettingQuery, useUpdateSettingMutation } = settingsApi
