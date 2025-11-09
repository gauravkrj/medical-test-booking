import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/mobile-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/bookings/[id] - Get a single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
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

    // Users can only view their own bookings (unless admin)
    if (user.role !== 'ADMIN' && booking.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
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

// PATCH /api/bookings/[id] - Update a booking (user can edit limited fields before confirmation)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Allow edit only if not confirmed/cancelled/completed
    if (['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(booking.status)) {
      return NextResponse.json({ error: 'Booking cannot be edited at this stage' }, { status: 400 })
    }

    // Only HOME_COLLECTION bookings editable
    if (booking.bookingType !== 'HOME_COLLECTION') {
      return NextResponse.json({ error: 'Only home collection bookings can be edited' }, { status: 400 })
    }

    const body = await request.json()
    const {
      patientName,
      patientAge,
      address,
      city,
      state,
      pincode,
      phone,
      bookingDate,
      bookingTime,
      notes,
    } = body

    const data: any = {}
    if (typeof patientName === 'string') data.patientName = patientName.trim()
    if (typeof patientAge === 'number') data.patientAge = patientAge
    if (typeof address === 'string') data.address = address.trim()
    if (typeof city === 'string') data.city = city.trim()
    if (typeof state === 'string') data.state = state.trim()
    if (typeof pincode === 'string') data.pincode = pincode.trim()
    if (typeof phone === 'string') data.phone = phone.replace(/\D/g, '')
    if (typeof notes === 'string') data.notes = notes.trim()

    if (bookingDate) {
      const d = new Date(bookingDate)
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: 'Invalid bookingDate' }, { status: 400 })
      }
      data.bookingDate = d
    }
    if (typeof bookingTime === 'string') data.bookingTime = bookingTime.trim()

    const updated = await prisma.booking.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

// POST /api/bookings/[id]/cancel - Request cancellation (user)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const url = new URL(request.url)
    const isCancel = url.pathname.endsWith('/cancel')
    if (!isCancel) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { reason } = await request.json()

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 })
    }

    if (booking.status === 'CONFIRMED' || booking.status === 'SAMPLE_COLLECTED' || booking.status === 'PROCESSING' || booking.status === 'COMPLETED') {
      // After confirmation, only request cancellation
      const updated = await prisma.booking.update({
        where: { id },
        data: {
          cancelRequested: true,
          cancelReason: typeof reason === 'string' ? reason.slice(0, 500) : null,
        },
      })
      return NextResponse.json({ ok: true, cancelRequested: true, booking: updated })
    }

    // If not yet confirmed, allow direct cancellation by user
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })
    return NextResponse.json({ ok: true, cancelled: true, booking: updated })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ error: 'Failed to request cancellation' }, { status: 500 })
  }
}

