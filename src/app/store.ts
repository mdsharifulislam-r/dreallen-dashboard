import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@/features/auth/authSlice'
import { baseApi } from '@/services/baseApi'
import '@/features/auth/authApi'
import '@/features/users/usersApi'
import '@/features/songs/songsApi'
import '@/features/videos/videosApi'
import '@/features/bts/btsApi'
import '@/features/packages/packagesApi'
import '@/features/subscribers/subscribersApi'
import '@/features/supports/supportsApi'
import '@/features/settings/settingsApi'
import '@/features/notifications/notificationsApi'
import '@/features/ratings/ratingsApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
