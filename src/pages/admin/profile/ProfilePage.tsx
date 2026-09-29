import { useEffect, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { KeyRound, UserCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/features/auth/authApi'
import { getErrorMessage } from '@/utils/errors'

export function ProfilePage() {
  const { data, isError, error, refetch } = useGetProfileQuery()
  const [updateProfile, updateState] = useUpdateProfileMutation()
  const [changePassword, passwordState] = useChangePasswordMutation()
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const profile = data?.data

  useEffect(() => {
    if (profile?.name) setName(profile.name)
  }, [profile?.name])

  const handleProfile = async (event: FormEvent) => {
    event.preventDefault()
    const body = new FormData()
    body.append('name', name)
    try {
      const result = await updateProfile(body).unwrap()
      toast.success(result.message ?? 'Profile updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handlePassword = async (event: FormEvent) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      const result = await changePassword({ currentPassword, newPassword, confirmPassword }).unwrap()
      toast.success(result.message ?? 'Password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description={profile?.email ?? 'Manage your admin account and credentials.'}
      />

      {/* Avatar / identity block */}
      <div className="flex items-center gap-4 rounded-2xl border border-[#26201a] bg-[#161310] px-6 py-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 font-extrabold text-stone-950 text-xl shadow-lg">
          {(profile?.name ?? 'A').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-extrabold text-white text-lg leading-tight">{profile?.name ?? '—'}</p>
          <p className="text-sm text-stone-400">{profile?.email ?? '—'}</p>
          <span className="mt-1 inline-block rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
            {profile?.role ?? 'Admin'}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Account Info Card */}
        <Card className="bg-[#161310] p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <UserCircle className="h-5 w-5" />
            </div>
            <h2 className="font-bold text-white text-base">Account Info</h2>
          </div>
          <form className="space-y-4" onSubmit={handleProfile}>
            <FormField
              label="Display Name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />
            <FormField
              label="Email Address"
              value={profile?.email ?? ''}
              disabled
              hint="Email cannot be changed here."
            />
            <div className="pt-1">
              <Button type="submit" variant="amber-pill" loading={updateState.isLoading} className="w-full sm:w-auto">
                Save Profile
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card className="bg-[#161310] p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <h2 className="font-bold text-white text-base">Change Password</h2>
          </div>
          <form className="space-y-4" onSubmit={handlePassword}>
            <FormField
              label="Current Password"
              type="password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="••••••••"
            />
            <FormField
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="••••••••"
            />
            <FormField
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
            />
            <div className="pt-1">
              <Button type="submit" variant="amber-pill" loading={passwordState.isLoading} className="w-full sm:w-auto">
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
