import { baseApi } from '@/services/baseApi'
import type { ApiSuccess } from '@/types/api'
import type {
  AdminProfile,
  ChangePasswordRequest,
  ForgetPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from '@/features/auth/types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<unknown, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    forgetPassword: builder.mutation<ApiSuccess<unknown>, ForgetPasswordRequest>({
      query: (body) => ({
        url: '/auth/forget-password',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<ApiSuccess<unknown>, VerifyOtpRequest>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<ApiSuccess<unknown>, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    changePassword: builder.mutation<ApiSuccess<unknown>, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),
    getProfile: builder.query<ApiSuccess<AdminProfile>, void>({
      query: () => '/user/profile',
      providesTags: ['Auth', 'User'],
    }),
    updateProfile: builder.mutation<ApiSuccess<AdminProfile>, FormData>({
      query: (body) => ({
        url: '/user/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
  }),
})

export const {
  useLoginMutation,
  useForgetPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi
