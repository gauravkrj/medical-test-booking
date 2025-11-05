import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { validatePassword } from '@/lib/password-policy'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req)
    const { success } = await authRateLimit.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { token, password } = await req.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    // Validate password policy
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!record || record.consumed || record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12) // Increased rounds
    await prisma.user.update({ where: { id: record.userId }, data: { password: passwordHash } })
    await prisma.passwordResetToken.update({ where: { id: record.id }, data: { consumed: true } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('reset-password error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


