import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { useForgetPasswordMutation } from '@/features/auth/authApi'
import { authStorage } from '@/utils/authStorage'
import { getErrorMessage } from '@/utils/errors'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [forgetPassword, { isLoading }] = useForgetPasswordMutation()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const result = await forgetPassword({ email }).unwrap()
      authStorage.setResetEmail(email)
      toast.success(result.message ?? 'OTP sent to your email')
      navigate('/admin/verify-otp')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Forgot password</h1>
      <p className="mt-2 text-sm text-muted">We will send an OTP to your admin email.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button type="submit" className="w-full" loading={isLoading}>
          Send OTP
        </Button>
      </form>
      <p className="mt-6 text-sm">
        <Link to="/admin/login" className="font-semibold text-brand">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
