import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Clapperboard,
  CreditCard,
  Film,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Music2,
  Settings,
  Star,
  User,
  Users,
  X,
} from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import { useGetProfileQuery } from '@/features/auth/authApi'
import { useGetNotificationsQuery } from '@/features/notifications/notificationsApi'
import { resolveMediaUrl } from '@/utils/mediaUrl'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/songs', label: 'Songs', icon: Music2 },
  { to: '/admin/videos', label: 'Videos', icon: Film },
  { to: '/admin/bts', label: 'Behind The Scenes', icon: Clapperboard },
  { to: '/admin/ratings', label: 'Ratings & Reviews', icon: Star },
  { to: '/admin/packages', label: 'Packages', icon: CreditCard },
  { to: '/admin/subscribers', label: 'Subscribers', icon: Users },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/supports', label: 'Support', icon: LifeBuoy },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: profile } = useGetProfileQuery()
  const { data: notifications } = useGetNotificationsQuery()
  const unread = notifications?.data?.unreadCount ?? 3
  const admin = profile?.data

  const crumbs = location.pathname
    .replace(/^\/admin\/?/, '')
    .split('/')
    .filter(Boolean)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100 lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col justify-between border-r border-[#1f1a15] bg-[#090807] text-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-[#1b1713]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-black shadow-lg shadow-amber-500/20">
                <Music2 className="h-5 w-5 text-stone-950" />
              </span>
              <div>
                <p className="font-extrabold text-base tracking-tight text-white leading-tight">UMF Admin</p>
                <p className="text-[9px] tracking-[0.22em] text-amber-500 font-extrabold uppercase">
                  URBAN MUSIC FLOW
                </p>
              </div>
            </div>
            <button type="button" className="text-stone-400 hover:text-white lg:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Menu
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isNotification = item.to === '/admin/notifications'
              const badgeValue = isNotification && unread > 0 ? unread : null

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 font-bold border-l-2 border-amber-500 shadow-inner'
                        : 'text-stone-400 hover:bg-[#181411] hover:text-stone-100'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {badgeValue ? (
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                      {badgeValue}
                    </span>
                  ) : null}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#1f1a15] bg-[#090807]/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-[#2b221a] bg-[#16120e] p-2 text-stone-300 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            {/* Breadcrumb pills */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
              <span className="text-stone-500">Admin</span>
              <span>/</span>
              <span className="rounded-lg bg-[#181411] border border-[#2b231c] px-3 py-1 text-stone-200 font-semibold capitalize">
                {crumbs.length ? crumbs[crumbs.length - 1].replaceAll('-', ' ') : 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Button with Amber Badge */}
            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
              className="relative rounded-xl border border-[#2b231c] bg-[#161310] p-2.5 text-stone-300 hover:border-amber-500/40 hover:text-white transition"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-stone-950 shadow-sm shadow-amber-500/50">
                  {unread}
                </span>
              ) : null}
            </button>

            {/* Profile Dropdown matching reference UI */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-3 rounded-xl border border-[#2b231c] bg-[#161310] px-3 py-1.5 transition hover:border-amber-500/40"
              >
                {admin?.image ? (
                  <img
                    src={resolveMediaUrl(admin.image)}
                    alt=""
                    className="h-8 w-8 rounded-lg object-cover border border-amber-500/30"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-xs font-extrabold text-stone-950 shadow-sm">
                    {(admin?.name ?? 'D').charAt(0)}
                  </span>
                )}
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-bold text-white leading-tight">
                    {admin?.name ?? 'Dre Allen'}
                  </span>
                  <span className="block text-[10px] font-semibold text-amber-500 leading-tight">
                    Super Admin
                  </span>
                </span>
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#29221b] bg-[#161310] p-1.5 shadow-2xl shadow-black/80">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-stone-300 hover:bg-[#201a15] hover:text-white"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/admin/profile')
                    }}
                  >
                    <User className="h-4 w-4 text-amber-400" />
                    Profile Settings
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-4 py-6 sm:px-8 max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

