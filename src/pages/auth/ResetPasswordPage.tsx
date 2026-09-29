import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { useResetPasswordMutation } from '@/features/auth/authApi'
import { authStorage } from '@/utils/authStorage'
import { getErrorMessage } from '@/utils/errors'

export function ResetPasswordPage() {
  const otp = authStorage.getResetOtp()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      const result = await resetPassword({ otp, newPassword, confirmPassword }).unwrap()
      authStorage.clearResetFlow()
      toast.success(result.message ?? 'Password reset successfully')
      navigate('/admin/login', { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Reset password</h1>
      <p className="mt-2 text-sm text-muted">Choose a new password for your admin account.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="New password"
          type="password"
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <FormField
          label="Confirm password"
          type="password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <Button type="submit" className="w-full" loading={isLoading} disabled={!otp}>
          Reset password
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
