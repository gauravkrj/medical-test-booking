import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { bookingRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { sanitizeString, sanitizePhone, sanitizeInteger, sanitizeURL } from '@/lib/sanitize'
import { ApiErrors, createSuccessResponse, handleApiError } from '@/lib/api-error'
import { sendEmail, getEmailBaseUrl, getLabName } from '@/lib/email'
import { getBookingConfirmationTemplate } from '@/lib/email-templates/booking-confirmation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/bookings - Get current user's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return ApiErrors.UNAUTHORIZED('You must be logged in to view your bookings')
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id as string,
      },
      include: {
        items: {
          include: {
            test: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return createSuccessResponse(bookings)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return ApiErrors.UNAUTHORIZED('You must be logged in to create a booking')
    }

    // Rate limiting
    const identifier = session.user.id || getRateLimitIdentifier(request)
    const { success, reset } = await bookingRateLimit.limit(identifier)
    
    if (!success) {
      const retryAfter = Math.round((reset - Date.now()) / 1000)
      return ApiErrors.RATE_LIMIT_EXCEEDED(retryAfter)
    }

    const body = await request.json()
    const {
      bookingType: rawBookingType,
      patientName: rawPatientName,
      patientAge: rawPatientAge,
      bookingDate: rawBookingDate,
      bookingTime: rawBookingTime,
      address: rawAddress,
      city: rawCity,
      state: rawState,
      pincode: rawPincode,
      phone: rawPhone,
      prescriptionUrl: rawPrescriptionUrl,
      notes: rawNotes,
      testIds, // Array of test IDs
    } = body

    // Sanitize all inputs
    const bookingType = rawBookingType === 'HOME_COLLECTION' || rawBookingType === 'CLINIC_VISIT' 
      ? rawBookingType 
      : null
    const patientName = sanitizeString(rawPatientName)
    const patientAge = sanitizeInteger(rawPatientAge)
    const city = sanitizeString(rawCity)
    const state = rawState ? sanitizeString(rawState) : null
    const pincode = rawPincode ? sanitizeString(rawPincode) : null
    const phone = sanitizePhone(rawPhone)
    const address = rawAddress ? sanitizeString(rawAddress) : null
    const bookingTime = rawBookingTime ? sanitizeString(rawBookingTime) : null
    const prescriptionUrl = rawPrescriptionUrl ? sanitizeURL(rawPrescriptionUrl) : null
    const notes = rawNotes ? sanitizeString(rawNotes) : null

    // Validate booking date
    let bookingDate: Date | null = null
    if (rawBookingDate) {
      const date = new Date(rawBookingDate)
      if (isNaN(date.getTime())) {
        return ApiErrors.VALIDATION_ERROR({ field: 'bookingDate', message: 'Invalid booking date format' })
      }
      bookingDate = date
    }

    // Validate required fields
    if (!bookingType || !patientName || !patientAge || !city || !phone || !testIds || !Array.isArray(testIds) || testIds.length === 0) {
      return ApiErrors.VALIDATION_ERROR({
        message: 'Missing required fields',
        required: ['bookingType', 'patientName', 'patientAge', 'city', 'phone', 'testIds'],
      })
    }

    // Validate patient age
    if (patientAge === null || patientAge < 1 || patientAge > 150) {
      return ApiErrors.VALIDATION_ERROR({ field: 'patientAge', message: 'Patient age must be between 1 and 150' })
    }

    // For home collection, address is required
    if (bookingType === 'HOME_COLLECTION' && !address) {
      return ApiErrors.VALIDATION_ERROR({ field: 'address', message: 'Address is required for home collection' })
    }

    // Validate testIds are strings
    const validTestIds = testIds.filter((id: any) => typeof id === 'string' && id.length > 0)
    if (validTestIds.length === 0) {
      return ApiErrors.VALIDATION_ERROR({ field: 'testIds', message: 'At least one valid test ID is required' })
    }

    // Fetch tests and calculate total amount
    const tests = await prisma.test.findMany({
      where: {
        id: { in: validTestIds },
        isActive: true,
      },
    })

    if (tests.length !== validTestIds.length) {
      return ApiErrors.NOT_FOUND('One or more tests not found or inactive')
    }

    const totalAmount = tests.reduce((sum, test) => sum + test.price, 0)

    // Get user details for email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { name: true, email: true },
    })

    // Create booking with items
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id as string,
        bookingType,
        patientName,
        patientAge,
        bookingDate,
        bookingTime,
        address,
        city,
        state,
        pincode,
        phone,
        prescriptionUrl,
        notes,
        totalAmount,
        status: 'PENDING',
        items: {
          create: tests.map((test) => ({
            testId: test.id,
            price: test.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            test: true,
          },
        },
      },
    })

    // Send booking confirmation email (non-blocking)
    if (user?.email) {
      try {
        const labName = await getLabName()
        const baseUrl = getEmailBaseUrl()
        const html = getBookingConfirmationTemplate({
          name: user.name || 'User',
          bookingId: booking.id,
          bookingDate: booking.bookingDate?.toISOString() || null,
          bookingTime: booking.bookingTime,
          bookingType: booking.bookingType,
          totalAmount: booking.totalAmount,
          tests: booking.items.map((item) => ({
            name: item.test.name,
            price: item.price,
          })),
          labName,
          baseUrl,
        })
        
        await sendEmail({
          to: user.email,
          subject: `Booking Confirmed - ${booking.id}`,
          html,
        })
      } catch (emailError) {
        // Log but don't fail booking if email fails
        console.error('Failed to send booking confirmation email:', emailError)
      }
    }

    return createSuccessResponse(booking, 201, 'Booking created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

