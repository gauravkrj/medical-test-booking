import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/settings - Public route to get site configuration
export async function GET(request: NextRequest) {
  try {
    const config = await prisma.siteConfig.findFirst()

    if (!config) {
      return NextResponse.json({
        labName: 'Lab Test Booking',
        labAddress: '',
        labCity: '',
        labState: '',
        labPincode: '',
        labPhone: '',
        labEmail: '',
        labLogoUrl: null,
        primaryColor: null,
        secondaryColor: null,
        aboutText: null,
        termsText: null,
        privacyText: null,
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

