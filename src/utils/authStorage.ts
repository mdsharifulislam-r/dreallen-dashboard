const ACCESS_TOKEN_KEY = 'dreallen_admin_access_token'
const RESET_EMAIL_KEY = 'dreallen_admin_reset_email'
const RESET_OTP_KEY = 'dreallen_admin_reset_otp'

export const authStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },
  clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  },
  getResetEmail(): string {
    return sessionStorage.getItem(RESET_EMAIL_KEY) ?? ''
  },
  setResetEmail(email: string) {
    sessionStorage.setItem(RESET_EMAIL_KEY, email)
  },
  getResetOtp(): string {
    return sessionStorage.getItem(RESET_OTP_KEY) ?? ''
  },
  setResetOtp(otp: string) {
    sessionStorage.setItem(RESET_OTP_KEY, otp)
  },
  clearResetFlow() {
    sessionStorage.removeItem(RESET_EMAIL_KEY)
    sessionStorage.removeItem(RESET_OTP_KEY)
  },
}
