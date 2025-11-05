'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut, FlaskConical } from 'lucide-react'
import Image from 'next/image'

export default function Navbar({ labName = 'Lab Test Booking', logoUrl = '' }: { labName?: string; logoUrl?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="glass-dark sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={session?.user?.role === 'ADMIN' ? '/admin/dashboard' : '/'} className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                {logoUrl ? (
                  <Image src={logoUrl} alt={labName} width={48} height={48} className="object-cover w-12 h-12" />
                ) : (
                  <FlaskConical className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gradient">
                {labName}
              </span>
              <span className="text-xs text-gray-400 -mt-1">
                {session?.user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Book Tests Online'}
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {session?.user?.role !== 'ADMIN' && (
              <>
                <Link 
                  href="/" 
                  className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
                >
                  Home
                </Link>
                <Link 
                  href="/tests" 
                  className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
                >
                  All Tests
                </Link>
              </>
            )}
            {session?.user?.role === 'USER' && (
              <Link 
                href="/bookings" 
                className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
              >
                My Bookings
              </Link>
            )}
            {session ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-white/10">
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-200 font-medium">{session.user?.name || session.user?.email}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="gradient-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 glass rounded-lg text-gray-300 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-white/10">
            {session?.user?.role !== 'ADMIN' && (
              <>
                <Link href="/" className="block text-gray-300 hover:text-white py-2">
                  Home
                </Link>
                <Link href="/tests" className="block text-gray-300 hover:text-white py-2">
                  All Tests
                </Link>
              </>
            )}
            {session?.user?.role === 'USER' && (
              <Link href="/bookings" className="block text-gray-300 hover:text-white py-2">
                My Bookings
              </Link>
            )}
            {session ? (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-4 py-2 glass rounded-lg hover:bg-white/10"
                >
                  <User className="w-5 h-5 text-gray-300" />
                  <span className="text-gray-200">{session.user?.name || session.user?.email}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-2 px-4 py-2 glass rounded-lg text-gray-300 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="block gradient-primary text-white px-6 py-2.5 rounded-lg font-semibold text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

