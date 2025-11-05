import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function sendSms(phone: string, message: string) {
  const provider = process.env.SMS_PROVIDER || 'console'
  
  if (provider === 'console') {
    console.log(`[SMS][DEV] to:${phone} msg:${message}`)
    return
  }
  
  if (provider === 'twilio') {
    const sid = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_FROM_NUMBER
    if (!sid || !token || !from) throw new Error('Twilio env vars missing')
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`
    const body = new URLSearchParams({ To: phone, From: from, Body: message })
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Twilio send error: ${res.status} ${txt}`)
    }
    return
  }
  
  if (provider === 'msg91') {
    // MSG91 (popular in India) - https://msg91.com
    const authkey = process.env.MSG91_AUTH_KEY
    const sender = process.env.MSG91_SENDER_ID || 'LABTST'
    if (!authkey) throw new Error('MSG91_AUTH_KEY env var missing')
    const url = `https://api.msg91.com/api/v2/sendsms?campaign=0&route=4`
    const body = JSON.stringify({
      sender: sender,
      route: '4',
      country: '91',
      sms: [{ message: message, to: [phone.replace(/^\+?91/, '')] }]
    })
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'authkey': authkey,
        'Content-Type': 'application/json',
      },
      body,
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`MSG91 send error: ${res.status} ${txt}`)
    }
    return
  }
  
  if (provider === 'fast2sms') {
    // Fast2SMS (India) - https://www.fast2sms.com
    const apiKey = process.env.FAST2SMS_API_KEY
    if (!apiKey) throw new Error('FAST2SMS_API_KEY env var missing')
    const url = 'https://www.fast2sms.com/dev/bulkV2'
    const body = JSON.stringify({
      route: 'otp',
      variables_values: message.split(' ')[0], // Extract OTP code
      numbers: phone.replace(/^\+?91/, ''),
    })
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body,
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Fast2SMS send error: ${res.status} ${txt}`)
    }
    return
  }
  
  if (provider === 'vonage') {
    // Vonage (formerly Nexmo) - Free tier: $2.50 credit - https://vonage.com
    const apiKey = process.env.VONAGE_API_KEY
    const apiSecret = process.env.VONAGE_API_SECRET
    const from = process.env.VONAGE_FROM_NUMBER || 'Vonage'
    if (!apiKey || !apiSecret) throw new Error('Vonage API credentials missing')
    
    const url = 'https://rest.nexmo.com/sms/json'
    const params = new URLSearchParams({
      api_key: apiKey,
      api_secret: apiSecret,
      to: phone.replace(/^\+/, ''),
      from: from,
      text: message,
    })
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const data = await res.json()
    if (data.messages?.[0]?.status !== '0') {
      throw new Error(`Vonage send error: ${data.messages?.[0]?.['error-text'] || 'Unknown error'}`)
    }
    return
  }
  
  if (provider === 'email-sms') {
    // Free: Email-to-SMS gateways (unreliable but free)
    // Most carriers accept SMS via email (e.g., number@txt.att.net)
    // This is a basic implementation - reliability varies by carrier
    const carrierGateways: Record<string, string> = {
      'verizon': '@vtext.com',
      'att': '@txt.att.net',
      'tmobile': '@tmomail.net',
      'sprint': '@messaging.sprintpcs.com',
      'vodafone': '@voda.co.uk',
      'orange': '@orange.net',
      'o2': '@o2.co.uk',
    }
    
    // Try to detect carrier or use generic
    const smtpHost = process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com'
    const smtpPort = parseInt(process.env.EMAIL_SMTP_PORT || '587')
    const smtpUser = process.env.EMAIL_SMTP_USER
    const smtpPass = process.env.EMAIL_SMTP_PASS
    
    if (!smtpUser || !smtpPass) {
      throw new Error('Email-to-SMS requires EMAIL_SMTP_USER and EMAIL_SMTP_PASS')
    }
    
    // For now, log the email that would be sent
    // In production, use nodemailer or similar to send actual email
    console.log(`[EMAIL-SMS] Would send to ${phone}@gateway: ${message}`)
    console.log(`[EMAIL-SMS] Note: Install nodemailer for actual email sending`)
    
    // TODO: Implement actual email sending with nodemailer
    // For now, this just logs - you'd need to install: npm install nodemailer
    return
  }
  
  throw new Error(`Unsupported SMS provider: ${provider}. Use: console, twilio, msg91, fast2sms, vonage, or email-sms`)
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
    }

    const code = generateOtp()
    const codeHash = await bcrypt.hash(code, 10)
    const ttlMinutes = 10
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)

    await prisma.otpRequest.create({ data: { phone, codeHash, expiresAt } })

    await sendSms(phone, `Your verification code is ${code}. It expires in ${ttlMinutes} minutes.`)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('request-otp error', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}


