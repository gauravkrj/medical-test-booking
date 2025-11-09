import { NextRequest } from 'next/server'
import { verifyJWT } from './jwt'
import { auth } from './auth'

// Helper to get user from either NextAuth session or JWT token (for mobile)
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Try NextAuth session first (for web)
    // In NextAuth v5, auth() automatically reads cookies from the request context
    const session = await auth()
    if (session?.user?.id) {
      return {
        id: session.user.id as string,
        email: session.user.email,
        role: session.user.role,
      }
    }
  } catch (error) {
    // Log error but continue to try JWT token as fallback
    console.error('Error getting NextAuth session:', error)
  }

  // Try JWT token from Authorization header (for mobile)
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = await verifyJWT(token)
      if (payload) {
        return {
          id: payload.id,
          email: payload.email,
          role: payload.role,
        }
      }
    }
  } catch (error) {
    // Log error but return null
    console.error('Error verifying JWT token:', error)
  }

  return null
}

