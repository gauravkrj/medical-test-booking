import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes (they have their own auth checks)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Public routes that don't require authentication
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/reset-password') ||
    pathname === '/tests' ||
    (pathname.startsWith('/tests/') && !pathname.includes('/book')) // /tests/[id] is public, /tests/[id]/book is not

  // Get session
  const session = await auth()

  // Admin routes (require ADMIN role)
  if (pathname.startsWith('/admin')) {
    if (!session || !session.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (session.user.role !== 'ADMIN') {
      // Redirect regular users to home
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // User routes (require USER role, not ADMIN)
  const isUserRoute =
    pathname.startsWith('/bookings') ||
    pathname.startsWith('/profile') ||
    pathname.includes('/tests/') && pathname.includes('/book') // /tests/[id]/book

  if (isUserRoute) {
    if (!session || !session.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (session.user.role === 'ADMIN') {
      // Redirect admins to admin dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    // Allow USER role
    return NextResponse.next()
  }

  // Public routes - allow everyone
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Default: allow the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (all API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}

