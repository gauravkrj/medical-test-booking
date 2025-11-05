import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { adminRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { sanitizeString, sanitizeNumber, sanitizeHTML } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/tests - Admin route to get all tests (including inactive)
export async function GET(request: NextRequest) {
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

    const tests = await prisma.test.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    )
  }
}

// POST /api/admin/tests - Admin route to create a new test
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
    if (!name || !category || price === null || !testType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate price
    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // Validate and sanitize FAQs
    let sanitizedFaqs: Prisma.JsonNull | Prisma.InputJsonValue = Prisma.JsonNull
    if (faqsJson && Array.isArray(faqsJson) && faqsJson.length > 0) {
      sanitizedFaqs = faqsJson.map((faq: any) => ({
        question: sanitizeString(faq.question || ''),
        answer: sanitizeString(faq.answer || ''),
      })).filter((faq: any) => faq.question && faq.answer)
    }

    const test = await prisma.test.create({
      data: {
        name,
        description,
        category,
        price,
        duration,
        testType,
        isActive: Boolean(isActive),
        about,
        parameters,
        preparation,
        why,
        interpretations,
        faqsJson: sanitizedFaqs,
      },
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    )
  }
}

