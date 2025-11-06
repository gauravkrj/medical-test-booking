import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(_request: NextRequest) {
  // Middleware disabled for debugging/deploy stabilization. Always allow.
  return NextResponse.next()
}

export const config = {
  matcher: [],
}

