import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST /api/upload - Upload file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret || cloudName === '' || apiKey === '' || apiSecret === '') {
      return NextResponse.json(
        { 
          error: 'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file.',
          details: 'Get your credentials from https://cloudinary.com/console'
        },
        { status: 500 }
      )
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    })

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate file type - only allow images and PDFs
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ]
    
    const fileType = file.type?.toLowerCase()
    if (!fileType || !allowedMimeTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file extension
    const fileName = file.name?.toLowerCase() || ''
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      return NextResponse.json(
        { error: 'Invalid file extension. Only images and PDF files are allowed.' },
        { status: 400 }
      )
    }

    // Additional security: Check file signature (magic numbers)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Check file signature
    const fileSignature = buffer.slice(0, 4).toString('hex').toUpperCase()
    const validSignatures: Record<string, string[]> = {
      'image/jpeg': ['FFD8FFE0', 'FFD8FFE1', 'FFD8FFE2', 'FFD8FFDB'],
      'image/png': ['89504E47'],
      'image/gif': ['47494638'],
      'image/webp': ['52494646'], // RIFF header (WebP starts with RIFF)
      'application/pdf': ['25504446'], // %PDF
    }
    
    const validSigs = validSignatures[fileType]
    if (validSigs && !validSigs.some(sig => fileSignature.startsWith(sig))) {
      // Special case for WebP - check RIFF...WEBP
      if (fileType === 'image/webp') {
        const webpHeader = buffer.slice(0, 12).toString('ascii')
        if (!webpHeader.includes('WEBP')) {
          return NextResponse.json(
            { error: 'File type mismatch. File signature does not match declared type.' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'File type mismatch. File signature does not match declared type.' },
          { status: 400 }
        )
      }
    }

    // Convert file to base64
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Detect resource type (PDFs as raw; images/videos as auto)
    const isPdf = file.type?.toLowerCase() === 'application/pdf'

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'lab-prescriptions',
      resource_type: isPdf ? 'raw' : 'auto',
    })

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: (result as any).format,
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    
    // Provide more specific error messages
    if (error?.http_code === 401) {
      return NextResponse.json(
        { 
          error: 'Cloudinary authentication failed. Please check your API credentials.',
          details: error.message || 'Invalid cloud_name, api_key, or api_secret'
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

