import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { authStorage } from '@/utils/authStorage'

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '')

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = authStorage.getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const url = typeof args === 'string' ? args : args.url
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/forget-password') ||
      url.includes('/auth/verify-otp') ||
      url.includes('/auth/reset-password')

    if (!isAuthEndpoint) {
      authStorage.clearAccessToken()
      api.dispatch({ type: 'auth/logout' })
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.assign('/admin/login')
      }
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Auth',
    'User',
    'UserList',
    'Song',
    'SongList',
    'Video',
    'VideoList',
    'Bts',
    'BtsList',
    'Package',
    'PackageList',
    'Subscriber',
    'SubscriberList',
    'Support',
    'SupportList',
    'Setting',
    'Notification',
    'Rating',
  ],
  endpoints: () => ({}),
})
