'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  FlaskConical, 
  Calendar, 
  Users, 
  Settings,
  LogOut
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/tests', label: 'Tests', icon: FlaskConical },
    { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-white/10 glass">
        <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="p-2 glass rounded-lg text-gray-300 hover:text-white"
        >
          {/* Simple menu icon */}
          <span className="block w-5 h-0.5 bg-gray-300 mb-1"></span>
          <span className="block w-5 h-0.5 bg-gray-300 mb-1"></span>
          <span className="block w-5 h-0.5 bg-gray-300"></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 glass border-r border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gradient">Admin Panel</h2>
                <p className="text-xs text-gray-400">Lab Management</p>
              </div>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="p-2 glass rounded-lg text-gray-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="mt-6 pt-6 border-t border-white/10 text-sm text-gray-400">
              <p className="font-medium text-white">{session.user.name || session.user.email}</p>
              <p className="text-xs mt-1">{session.user.email}</p>
            </div>
          </aside>
        </div>
      )}

      <div className="flex">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 min-h-screen glass border-r border-white/10 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gradient">Admin Panel</h1>
            <p className="text-sm text-gray-400 mt-1">Lab Management</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="px-4 py-2 text-sm text-gray-400">
              <p className="font-medium text-white">{session.user.name || session.user.email}</p>
              <p className="text-xs mt-1">{session.user.email}</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

