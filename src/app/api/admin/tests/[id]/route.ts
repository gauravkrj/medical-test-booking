import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { adminRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { sanitizeString, sanitizeNumber, sanitizeInteger, sanitizeHTML } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/tests/[id] - Admin route to get a single test
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

    const test = await prisma.test.findUnique({
      where: { id },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/tests/[id] - Admin route to update a test
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

    const {
      name: rawName,
      description: rawDescription,
      category: rawCategory,
      price: rawPrice,
      duration: rawDuration,
      testType: rawTestType,
      isActive,
      about: rawAbout,
      parameters: rawParameters,
      preparation: rawPreparation,
      why: rawWhy,
      interpretations: rawInterpretations,
      faqsJson,
    } = body

    // Check if test exists
    const existingTest = await prisma.test.findUnique({
      where: { id },
    })

    if (!existingTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    
    if (rawName !== undefined) updateData.name = sanitizeString(rawName)
    if (rawDescription !== undefined) updateData.description = rawDescription ? sanitizeString(rawDescription) : null
    if (rawCategory !== undefined) updateData.category = sanitizeString(rawCategory)
    if (rawPrice !== undefined) {
      const price = sanitizeNumber(rawPrice)
      if (price !== null && price > 0) {
        updateData.price = price
      }
    }
    if (rawDuration !== undefined) updateData.duration = rawDuration ? sanitizeInteger(rawDuration) : null
    if (rawTestType !== undefined) {
      updateData.testType = (rawTestType === 'HOME_TEST' || rawTestType === 'CLINIC_TEST') ? rawTestType : existingTest.testType
    }
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    if (rawAbout !== undefined) updateData.about = rawAbout ? sanitizeHTML(rawAbout) : null
    if (rawParameters !== undefined) updateData.parameters = rawParameters ? sanitizeHTML(rawParameters) : null
    if (rawPreparation !== undefined) updateData.preparation = rawPreparation ? sanitizeHTML(rawPreparation) : null
    if (rawWhy !== undefined) updateData.why = rawWhy ? sanitizeHTML(rawWhy) : null
    if (rawInterpretations !== undefined) updateData.interpretations = rawInterpretations ? sanitizeHTML(rawInterpretations) : null
    if (faqsJson !== undefined) {
      if (faqsJson && Array.isArray(faqsJson) && faqsJson.length > 0) {
        updateData.faqsJson = faqsJson.map((faq: any) => ({
          question: sanitizeString(faq.question || ''),
          answer: sanitizeString(faq.answer || ''),
        })).filter((faq: any) => faq.question && faq.answer)
      } else {
        updateData.faqsJson = Prisma.JsonNull
      }
    }

    const test = await prisma.test.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error updating test:', error)
    return NextResponse.json(
      { error: 'Failed to update test' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/tests/[id] - Admin route to delete a test
export async function DELETE(
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

    // Check if test exists
    const test = await prisma.test.findUnique({
      where: { id },
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    // Check if test has bookings
    const bookingItems = await prisma.bookingItem.findFirst({
      where: { testId: id },
    })

    if (bookingItems) {
      // Instead of deleting, mark as inactive
      await prisma.test.update({
        where: { id },
        data: { isActive: false },
      })
      return NextResponse.json({ message: 'Test deactivated (has bookings)' })
    }

    await prisma.test.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Test deleted successfully' })
  } catch (error) {
    console.error('Error deleting test:', error)
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    )
  }
}

