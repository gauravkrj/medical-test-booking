import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { sanitizeEmail, sanitizePhone, sanitizeString } from '@/lib/sanitize'
import { validatePassword } from '@/lib/password-policy'
import { sendEmail, getEmailBaseUrl, getLabName } from '@/lib/email'
import { getWelcomeEmailTemplate } from '@/lib/email-templates/welcome'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request)
    const { success, limit, reset, remaining } = await authRateLimit.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.round((reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.round((reset - Date.now()) / 1000).toString(),
          }
        }
      )
    }

    const body = await request.json()
    const {
      name: rawName,
      email: rawEmail,
      phone: rawPhone,
      password: rawPassword,
    } = body

    // Sanitize all inputs
    const name = sanitizeString(rawName)
    const email = sanitizeEmail(rawEmail)
    const phone = sanitizePhone(rawPhone)
    const password = typeof rawPassword === 'string' ? rawPassword : ''

    // Validate required fields
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12) // Increased rounds for better security

    // Create user (always USER role for signup)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    // Send welcome email (non-blocking)
    try {
      console.log('[SIGNUP] Attempting to send welcome email to:', user.email)
      const labName = await getLabName()
      const baseUrl = getEmailBaseUrl()
      console.log('[SIGNUP] Lab name:', labName, 'Base URL:', baseUrl)
      
      const html = getWelcomeEmailTemplate({
        name: user.name || 'User',
        labName,
        baseUrl,
      })
      
      const emailResult = await sendEmail({
        to: user.email,
        subject: `Welcome to ${labName}!`,
        html,
      })
      
      if (emailResult.success) {
        console.log('[SIGNUP] Welcome email sent successfully:', emailResult.messageId)
      } else {
        console.error('[SIGNUP] Failed to send welcome email:', emailResult.error)
      }
    } catch (emailError) {
      // Log but don't fail signup if email fails
      console.error('[SIGNUP] Error sending welcome email:', emailError)
    }

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

