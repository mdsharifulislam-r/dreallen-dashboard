import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { useLoginMutation } from '@/features/auth/authApi'
import { setCredentials } from '@/features/auth/authSlice'
import { useAppDispatch } from '@/app/hooks'
import { extractAccessToken } from '@/utils/authToken'
import { getErrorMessage } from '@/utils/errors'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const result = await login({
        email,
        password,
        auth_provider: 'local',
      }).unwrap()
      const token = extractAccessToken(result)
      if (!token) {
        toast.error('Login succeeded but no access token was found in the response.')
        return
      }
      dispatch(setCredentials({ accessToken: token }))
      toast.success('Welcome back')
      navigate('/admin/dashboard', { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-brand">Admin sign in</p>
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Use your Dreallen admin credentials to continue.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormField
          label="Password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div className="flex justify-end">
          <Link to="/admin/forgot-password" className="text-sm font-semibold text-brand">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isLoading}>
          Sign in
        </Button>
      </form>
    </div>
  )
}
