import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

// POST /api/bookings/[id]/cancel - Perform cancellation (pre-confirmation only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await request.json().catch(() => ({}))

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.userId !== (session.user.id as string) && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 })
    }

    // New rule: confirmed (or later) bookings cannot be cancelled or requested
    if (
      booking.status === 'CONFIRMED' ||
      booking.status === 'SAMPLE_COLLECTED' ||
      booking.status === 'PROCESSING' ||
      booking.status === 'COMPLETED'
    ) {
      return NextResponse.json({ error: 'Confirmed bookings cannot be cancelled' }, { status: 400 })
    }

    // Allow direct cancel for pre-confirmation
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })
    return NextResponse.json({ ok: true, cancelled: true, booking: updated })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
