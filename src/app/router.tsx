import { Navigate, createBrowserRouter } from 'react-router-dom'
import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { VerifyOtpPage } from '@/pages/auth/VerifyOtpPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { UsersPage } from '@/pages/admin/users/UsersPage'
import { SongsPage } from '@/pages/admin/songs/SongsPage'
import { UploadSongPage } from '@/pages/admin/songs/UploadSongPage'
import { SongReviewsPage } from '@/pages/admin/songs/SongReviewsPage'
import { VideosPage } from '@/pages/admin/videos/VideosPage'
import { UploadVideoPage } from '@/pages/admin/videos/UploadVideoPage'
import { VideoDetailPage } from '@/pages/admin/videos/VideoDetailPage'
import { BtsPage } from '@/pages/admin/bts/BtsPage'
import { BtsFormPage } from '@/pages/admin/bts/BtsFormPage'
import { BtsDetailPage } from '@/pages/admin/bts/BtsDetailPage'
import { PackagesPage } from '@/pages/admin/packages/PackagesPage'
import { PackageFormPage } from '@/pages/admin/packages/PackageFormPage'
import { SubscribersPage } from '@/pages/admin/subscribers/SubscribersPage'
import { SupportsPage } from '@/pages/admin/supports/SupportsPage'
import { SupportDetailPage } from '@/pages/admin/supports/SupportDetailPage'
import { NotificationsPage } from '@/pages/admin/notifications/NotificationsPage'
import { SettingsPage } from '@/pages/admin/settings/SettingsPage'
import { ProfilePage } from '@/pages/admin/profile/ProfilePage'
import { RatingsPage } from '@/pages/admin/ratings/RatingsPage'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/admin/dashboard" replace /> },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/admin/login', element: <LoginPage /> },
          { path: '/admin/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/admin/verify-otp', element: <VerifyOtpPage /> },
          { path: '/admin/reset-password', element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'songs', element: <SongsPage /> },
          { path: 'songs/upload', element: <UploadSongPage /> },
          { path: 'songs/:id/reviews', element: <SongReviewsPage /> },
          { path: 'videos', element: <VideosPage /> },
          { path: 'videos/upload', element: <UploadVideoPage /> },
          { path: 'videos/:id', element: <VideoDetailPage /> },
          { path: 'bts', element: <BtsPage /> },
          { path: 'bts/create', element: <BtsFormPage /> },
          { path: 'bts/:id', element: <BtsDetailPage /> },
          { path: 'bts/:id/edit', element: <BtsFormPage /> },
          { path: 'packages', element: <PackagesPage /> },
          { path: 'packages/create', element: <PackageFormPage /> },
          { path: 'packages/:id/edit', element: <PackageFormPage /> },
          { path: 'subscribers', element: <SubscribersPage /> },
          { path: 'supports', element: <SupportsPage /> },
          { path: 'supports/:id', element: <SupportDetailPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'ratings', element: <RatingsPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/admin/dashboard" replace /> },
])
