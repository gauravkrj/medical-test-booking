import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'POST route is working',
      method: 'POST',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Test route - use POST' })
}

