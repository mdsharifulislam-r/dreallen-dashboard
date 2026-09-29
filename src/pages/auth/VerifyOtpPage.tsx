import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { useVerifyOtpMutation } from '@/features/auth/authApi'
import { authStorage } from '@/utils/authStorage'
import { getErrorMessage } from '@/utils/errors'

export function VerifyOtpPage() {
  const email = authStorage.getResetEmail()
  const [otp, setOtp] = useState('')
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const result = await verifyOtp({ otp, email }).unwrap()
      authStorage.setResetOtp(otp)
      toast.success(result.message ?? 'OTP verified')
      navigate('/admin/reset-password')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Verify OTP</h1>
      <p className="mt-2 text-sm text-muted">
        Enter the OTP sent to {email || 'your email'}.
      </p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="OTP"
          required
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
        />
        <Button type="submit" className="w-full" loading={isLoading} disabled={!email}>
          Verify
        </Button>
      </form>
      <p className="mt-6 text-sm">
        <Link to="/admin/forgot-password" className="font-semibold text-brand">
          Use a different email
        </Link>
      </p>
    </div>
  )
}
