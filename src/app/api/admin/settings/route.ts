import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/settings - Get site configuration
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the first (and only) site config, or return defaults
    let config = await prisma.siteConfig.findFirst()

    if (!config) {
      // Return default empty config
      return NextResponse.json({
        labName: '',
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

// POST /api/admin/settings - Create or update site configuration
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      labName,
      labAddress,
      labCity,
      labState,
      labPincode,
      labPhone,
      labEmail,
      labLogoUrl,
      primaryColor,
      secondaryColor,
      aboutText,
      termsText,
      privacyText,
    } = body

    // Validate required fields
    if (!labName || !labAddress || !labCity || !labState || !labPincode || !labPhone || !labEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if config exists
    const existing = await prisma.siteConfig.findFirst()

    let config
    if (existing) {
      // Update existing
      config = await prisma.siteConfig.update({
        where: { id: existing.id },
        data: {
          labName,
          labAddress,
          labCity,
          labState,
          labPincode,
          labPhone,
          labEmail,
          labLogoUrl: labLogoUrl || null,
          primaryColor: primaryColor || null,
          secondaryColor: secondaryColor || null,
          aboutText: aboutText || null,
          termsText: termsText || null,
          privacyText: privacyText || null,
        },
      })
    } else {
      // Create new
      config = await prisma.siteConfig.create({
        data: {
          labName,
          labAddress,
          labCity,
          labState,
          labPincode,
          labPhone,
          labEmail,
          labLogoUrl: labLogoUrl || null,
          primaryColor: primaryColor || null,
          secondaryColor: secondaryColor || null,
          aboutText: aboutText || null,
          termsText: termsText || null,
          privacyText: privacyText || null,
        },
      })
    }

    // Revalidate the layout cache to force refresh
    const response = NextResponse.json(config)
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    response.headers.set('X-Revalidated', 'true')
    
    return response
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}

