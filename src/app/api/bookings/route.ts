import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/mobile-auth'
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
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return ApiErrors.UNAUTHORIZED('You must be logged in to view your bookings')
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
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
    const user = await getAuthenticatedUser(request)

    if (!user) {
      console.error('Booking POST: User not authenticated')
      return ApiErrors.UNAUTHORIZED('You must be logged in to create a booking')
    }

    console.log('Booking POST: User authenticated', { userId: user.id, email: user.email })

    // Rate limiting
    const identifier = user.id || getRateLimitIdentifier(request)
    const { success, reset } = await bookingRateLimit.limit(identifier)
    
    if (!success) {
      const retryAfter = Math.round((reset - Date.now()) / 1000)
      return ApiErrors.RATE_LIMIT_EXCEEDED(retryAfter)
    }

    let body: any
    try {
      body = await request.json()
    } catch (error) {
      console.error('Booking POST: Failed to parse request body', error)
      return ApiErrors.VALIDATION_ERROR({ message: 'Invalid request body format' })
    }

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

    // Sanitize all inputs with error handling
    let bookingType: 'HOME_COLLECTION' | 'CLINIC_VISIT' | null = null
    let patientName: string = ''
    let patientAge: number | null = null
    let city: string = ''
    let state: string | null = null
    let pincode: string | null = null
    let phone: string = ''
    let address: string | null = null
    let bookingTime: string | null = null
    let prescriptionUrl: string | null = null
    let notes: string | null = null

    try {
      bookingType = rawBookingType === 'HOME_COLLECTION' || rawBookingType === 'CLINIC_VISIT' 
        ? rawBookingType 
        : null
      patientName = sanitizeString(rawPatientName || '')
      patientAge = sanitizeInteger(rawPatientAge)
      city = sanitizeString(rawCity || '')
      state = rawState ? sanitizeString(rawState) : null
      pincode = rawPincode ? sanitizeString(rawPincode) : null
      phone = sanitizePhone(rawPhone || '')
      address = rawAddress ? sanitizeString(rawAddress) : null
      bookingTime = rawBookingTime ? sanitizeString(rawBookingTime) : null
      // Prescription URL is optional, so if it fails validation, just set to null
      prescriptionUrl = rawPrescriptionUrl ? (sanitizeURL(rawPrescriptionUrl) || null) : null
      notes = rawNotes ? sanitizeString(rawNotes) : null
    } catch (error) {
      console.error('Booking POST: Error during sanitization', error)
      return ApiErrors.VALIDATION_ERROR({ 
        message: 'Error processing input data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      })
    }

    // Validate booking date
    let bookingDate: Date | null = null
    if (rawBookingDate) {
      const date = new Date(rawBookingDate)
      if (isNaN(date.getTime())) {
        return ApiErrors.VALIDATION_ERROR({ field: 'bookingDate', message: 'Invalid booking date format' })
      }
      bookingDate = date
    }

    // Validate required fields with detailed logging
    const missingFields: string[] = []
    if (!bookingType) missingFields.push('bookingType')
    if (!patientName) missingFields.push('patientName')
    if (!patientAge) missingFields.push('patientAge')
    if (!city) missingFields.push('city')
    if (!phone) missingFields.push('phone')
    if (!testIds || !Array.isArray(testIds) || testIds.length === 0) missingFields.push('testIds')

    if (missingFields.length > 0) {
      console.error('Booking POST: Missing required fields', { 
        missingFields,
        receivedData: {
          bookingType: rawBookingType,
          patientName: rawPatientName ? 'present' : 'missing',
          patientAge: rawPatientAge,
          city: rawCity ? 'present' : 'missing',
          phone: rawPhone ? 'present' : 'missing',
          testIds: testIds ? (Array.isArray(testIds) ? testIds.length : 'not array') : 'missing',
        }
      })
      return ApiErrors.VALIDATION_ERROR({
        message: 'Missing required fields',
        details: { missingFields, required: ['bookingType', 'patientName', 'patientAge', 'city', 'phone', 'testIds'] },
      })
    }

    // Validate patient age
    if (patientAge === null || patientAge < 1 || patientAge > 150) {
      return ApiErrors.VALIDATION_ERROR({ field: 'patientAge', message: 'Patient age must be between 1 and 150' })
    }

    // At this point, TypeScript knows bookingType and patientAge are not null
    // since we've validated them above
    const validatedBookingType: 'HOME_COLLECTION' | 'CLINIC_VISIT' = bookingType!
    const validatedPatientAge: number = patientAge!

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
    let tests
    try {
      tests = await prisma.test.findMany({
        where: {
          id: { in: validTestIds },
          isActive: true,
        },
      })
    } catch (error) {
      console.error('Booking POST: Error fetching tests', error)
      return ApiErrors.INTERNAL_SERVER_ERROR('Failed to fetch test information')
    }

    if (tests.length !== validTestIds.length) {
      console.error('Booking POST: Tests not found', { 
        requested: validTestIds, 
        found: tests.map(t => t.id) 
      })
      return ApiErrors.NOT_FOUND('One or more tests not found or inactive')
    }

    const totalAmount = tests.reduce((sum, test) => sum + test.price, 0)

    // Get user details for email
    let userDetails
    try {
      userDetails = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, email: true },
      })
    } catch (error) {
      console.error('Booking POST: Error fetching user details', error)
      // Don't fail booking if we can't get user details for email
    }

    // Create booking with items
    let booking
    try {
      booking = await prisma.booking.create({
        data: {
          userId: user.id,
          bookingType: validatedBookingType,
          patientName,
          patientAge: validatedPatientAge,
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
    } catch (error: any) {
      console.error('Booking POST: Error creating booking in database', {
        error: error?.message,
        code: error?.code,
        meta: error?.meta,
        userId: user.id,
        testIds: validTestIds,
      })
      
      // Handle Prisma errors
      if (error?.code === 'P2002') {
        return ApiErrors.VALIDATION_ERROR({ message: 'A booking with this information already exists' })
      }
      if (error?.code === 'P2003') {
        return ApiErrors.VALIDATION_ERROR({ message: 'Invalid reference to related data' })
      }
      
      // Re-throw to be caught by outer catch
      throw error
    }

    // Send booking confirmation email (non-blocking)
    if (userDetails?.email) {
      try {
        const labName = await getLabName()
        const baseUrl = getEmailBaseUrl()
        const html = getBookingConfirmationTemplate({
          name: userDetails.name || 'User',
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
          to: userDetails.email,
          subject: `Booking Confirmed - ${booking.id}`,
          html,
        })
      } catch (emailError) {
        // Log but don't fail booking if email fails
        console.error('Failed to send booking confirmation email:', emailError)
      }
    }

    console.log('Booking POST: Booking created successfully', { bookingId: booking.id })
    return createSuccessResponse(booking, 201, 'Booking created successfully')
  } catch (error) {
    console.error('Booking POST: Error creating booking', error)
    // Log full error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error)
    }
    return handleApiError(error)
  }
}

