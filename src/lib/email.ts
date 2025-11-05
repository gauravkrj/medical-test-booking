/**
 * Email sending utility
 * Supports SMTP (via nodemailer) or console logging for development
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send email via SMTP or console (for development)
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const { to, subject, html, text } = options

  // If SMTP is not configured, log to console
  if (!process.env.SMTP_HOST || process.env.EMAIL_FROM === 'console' || !process.env.SMTP_USER) {
    console.log('\n' + '='.repeat(60))
    console.log(`[EMAIL][DEV MODE] - SMTP not configured, logging to console`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`From: ${process.env.EMAIL_FROM || 'noreply@labtest.com'}`)
    console.log('-'.repeat(60))
    if (text) {
      console.log(text)
    } else {
      // Strip HTML tags for console display
      const plainText = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      console.log(plainText.substring(0, 500) + (plainText.length > 500 ? '...' : ''))
    }
    console.log('='.repeat(60) + '\n')
    return { success: true, messageId: 'console-log' }
  }

  // Use nodemailer for SMTP
  try {
    const nodemailer = await import('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error.message || 'Failed to send email',
    }
  }
}

/**
 * Get email base URL
 */
export function getEmailBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

/**
 * Get lab name from settings
 */
export async function getLabName(): Promise<string> {
  try {
    const { prisma } = await import('./prisma')
    const settings = await prisma.siteConfig.findFirst()
    return settings?.labName || 'Lab Test Booking'
  } catch {
    return 'Lab Test Booking'
  }
}

