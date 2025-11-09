import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Mobile app session endpoint (uses JWT token instead of NextAuth)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyJWT(token)

    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
    })
  } catch (error) {
    console.error('Mobile session error:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

