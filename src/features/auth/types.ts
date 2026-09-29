import type { AuthorRef } from '@/types/api'

export interface LoginRequest {
  email: string
  password: string
  auth_provider: 'local'
}

export interface ForgetPasswordRequest {
  email: string
}

export interface VerifyOtpRequest {
  otp: string
  email: string
}

export interface ResetPasswordRequest {
  otp: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AdminProfile extends AuthorRef {
  user_name?: string
  songs_alarm?: boolean | string
}

export interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean
}
