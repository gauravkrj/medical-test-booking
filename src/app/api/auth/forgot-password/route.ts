import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { authRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { sanitizeEmail } from '@/lib/sanitize'
import { sendEmail, getEmailBaseUrl, getLabName } from '@/lib/email'
import { getPasswordResetTemplate } from '@/lib/email-templates/password-reset'

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

    const { email: rawEmail } = await req.json()
    const email = sanitizeEmail(rawEmail)
    
    if (!email) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Do not reveal existence; return ok
      return NextResponse.json({ ok: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    })

    // Send password reset email with HTML template
    try {
      const baseUrl = getEmailBaseUrl()
      const labName = await getLabName()
      const resetUrl = `${baseUrl}/reset-password?token=${token}`
      const html = getPasswordResetTemplate({
        name: user.name || 'User',
        resetUrl,
        labName,
        expiresIn: '30 minutes',
      })
      
      await sendEmail({
        to: email,
        subject: `Reset Your Password - ${labName}`,
        html,
      })
    } catch (emailError) {
      // Log but don't fail if email fails
      console.error('Failed to send password reset email:', emailError)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('forgot-password error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


