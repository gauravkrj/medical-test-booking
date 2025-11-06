import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { adminRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { sanitizeString, sanitizeNumber, sanitizeInteger, sanitizeHTML } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/admin/tests/new - Create a new test
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      name: rawName,
      description: rawDescription,
      category: rawCategory,
      price: rawPrice,
      duration: rawDuration,
      testType: rawTestType,
      isActive = true,
      about: rawAbout,
      parameters: rawParameters,
      preparation: rawPreparation,
      why: rawWhy,
      interpretations: rawInterpretations,
      faqsJson,
    } = body

    // Sanitize inputs
    const name = sanitizeString(rawName)
    const description = rawDescription ? sanitizeString(rawDescription) : null
    const category = sanitizeString(rawCategory)
    const price = sanitizeNumber(rawPrice)
    const duration = rawDuration ? sanitizeInteger(rawDuration) : null
    const testType = rawTestType === 'HOME_TEST' || rawTestType === 'CLINIC_TEST' ? rawTestType : null
    const about = rawAbout ? sanitizeHTML(rawAbout) : null
    const parameters = rawParameters ? sanitizeHTML(rawParameters) : null
    const preparation = rawPreparation ? sanitizeHTML(rawPreparation) : null
    const why = rawWhy ? sanitizeHTML(rawWhy) : null
    const interpretations = rawInterpretations ? sanitizeHTML(rawInterpretations) : null

    // Validate required fields
    const missing: string[] = []
    if (!name) missing.push('name')
    if (!category) missing.push('category')
    if (price === null) missing.push('price')
    if (!testType) missing.push('testType')

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing or invalid fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if (price !== null && price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    if (duration !== null && (duration as number) < 0) {
      return NextResponse.json(
        { error: 'Duration must be a positive integer (days)' },
        { status: 400 }
      )
    }

    let sanitizedFaqs: Prisma.InputJsonValue | null = null
    if (faqsJson && Array.isArray(faqsJson) && faqsJson.length > 0) {
      const filtered = faqsJson.map((faq: any) => ({
        question: sanitizeString(faq.question || ''),
        answer: sanitizeString(faq.answer || ''),
      })).filter((faq: any) => faq.question && faq.answer)
      sanitizedFaqs = filtered.length > 0 ? filtered : null
    }

    const test = await prisma.test.create({
      data: {
        name,
        description,
        category,
        price: (price as number),
        duration: duration === null ? null : (duration as number),
        testType,
        isActive: Boolean(isActive),
        about,
        parameters,
        preparation,
        why,
        interpretations,
        faqsJson: sanitizedFaqs ?? Prisma.JsonNull,
      },
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error: any) {
    console.error('Error creating test:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A test with this name already exists' },
          { status: 400 }
        )
      }
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to create test' },
      { status: 500 }
    )
  }
}

