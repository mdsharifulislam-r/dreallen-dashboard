import { Music2 } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-[#0c0a09] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#090807] border-r border-[#1f1a15] text-white lg:flex lg:flex-col lg:justify-between p-12">
        <div className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-black shadow-lg shadow-amber-500/20">
            <Music2 className="h-6 w-6 text-stone-950" />
          </span>
          <div>
            <p className="text-xl font-extrabold tracking-tight text-white leading-tight">UMF Admin</p>
            <p className="text-[10px] tracking-[0.22em] text-amber-500 font-extrabold uppercase">
              URBAN MUSIC FLOW
            </p>
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white">
            Keep the catalog, artists, and members in tune.
          </h2>
          <p className="mt-4 text-sm text-stone-400 leading-relaxed">
            Manage songs, videos, packages, and support from one gold-lit control room.
          </p>
        </div>
        <p className="relative text-xs font-semibold text-stone-500">UMF Urban Music Flow platform</p>
      </div>
      <div className="flex items-center justify-center bg-[#0c0a09] px-6 py-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

