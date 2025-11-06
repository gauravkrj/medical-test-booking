import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { adminRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { sanitizeString } from '@/lib/sanitize'
import { sendEmail, getEmailBaseUrl, getLabName } from '@/lib/email'
import { getBookingStatusUpdateTemplate } from '@/lib/email-templates/booking-status-update'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/bookings/[id] - Get a single booking (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            test: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/bookings/[id] - Update booking status (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting
    const identifier = session.user.id || getRateLimitIdentifier(request)
    const { success } = await adminRateLimit.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status: rawStatus, notes: rawNotes } = body

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'SAMPLE_COLLECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED']
    const status = validStatuses.includes(rawStatus) ? rawStatus : null

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const oldStatus = existingBooking.status
    
    const updateData: any = {}
    if (status) {
      updateData.status = status
      // If approving cancellation, record review metadata
      if (status === 'CANCELLED') {
        updateData.cancelReviewedAt = new Date()
        updateData.cancelReviewedBy = session.user.id as string
        // Clear request flag if it existed
        updateData.cancelRequested = false
      }
    }
    if (rawNotes !== undefined) {
      updateData.notes = rawNotes ? sanitizeString(rawNotes) : null
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            test: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    // Send status update email if status changed (non-blocking)
    if (status && status !== oldStatus && booking.user.email) {
      try {
        const labName = await getLabName()
        const baseUrl = getEmailBaseUrl()
        const html = getBookingStatusUpdateTemplate({
          name: booking.user.name || 'User',
          bookingId: booking.id,
          oldStatus,
          newStatus: status,
          labName,
          baseUrl,
          notes: booking.notes,
        })
        
        await sendEmail({
          to: booking.user.email,
          subject: `Booking Status Updated - ${booking.id}`,
          html,
        })
      } catch (emailError) {
        // Log but don't fail update if email fails
        console.error('Failed to send status update email:', emailError)
      }
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

