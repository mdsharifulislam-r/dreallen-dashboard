import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthState } from '@/features/auth/types'
import { authStorage } from '@/utils/authStorage'

const token = authStorage.getAccessToken()

const initialState: AuthState = {
  accessToken: token,
  isAuthenticated: Boolean(token),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      authStorage.setAccessToken(action.payload.accessToken)
    },
    logout: (state) => {
      state.accessToken = null
      state.isAuthenticated = false
      authStorage.clearAccessToken()
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export const authReducer = authSlice.reducer
