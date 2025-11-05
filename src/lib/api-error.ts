import { NextResponse } from 'next/server'

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  success: false
  error: string
  message?: string
  details?: any
  code?: string
  timestamp?: string
}

/**
 * Standard API success response format
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  options?: {
    message?: string
    details?: any
    code?: string
  }
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  }

  if (options?.message) {
    response.message = options.message
  }

  if (options?.details) {
    response.details = options.details
  }

  if (options?.code) {
    response.code = options.code
  }

  return NextResponse.json(response, { status })
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  }

  if (message) {
    response.message = message
  }

  return NextResponse.json(response, { status })
}

/**
 * Common error responses
 */
export const ApiErrors = {
  // Authentication errors (401)
  UNAUTHORIZED: (message?: string) =>
    createErrorResponse('Unauthorized', 401, {
      message: message || 'You must be authenticated to access this resource',
      code: 'UNAUTHORIZED',
    }),

  // Forbidden errors (403)
  FORBIDDEN: (message?: string) =>
    createErrorResponse('Forbidden', 403, {
      message: message || 'You do not have permission to access this resource',
      code: 'FORBIDDEN',
    }),

  // Not found errors (404)
  NOT_FOUND: (resource?: string) =>
    createErrorResponse('Not Found', 404, {
      message: resource ? `${resource} not found` : 'Resource not found',
      code: 'NOT_FOUND',
    }),

  // Validation errors (400)
  VALIDATION_ERROR: (details?: any) =>
    createErrorResponse('Validation Error', 400, {
      message: 'The provided data is invalid',
      details,
      code: 'VALIDATION_ERROR',
    }),

  // Rate limit errors (429)
  RATE_LIMIT_EXCEEDED: (retryAfter?: number) =>
    createErrorResponse('Too Many Requests', 429, {
      message: 'Rate limit exceeded. Please try again later.',
      details: retryAfter ? { retryAfter } : undefined,
      code: 'RATE_LIMIT_EXCEEDED',
    }),

  // Server errors (500)
  INTERNAL_SERVER_ERROR: (message?: string) =>
    createErrorResponse('Internal Server Error', 500, {
      message: message || 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    }),

  // Bad request (400)
  BAD_REQUEST: (message?: string, details?: any) =>
    createErrorResponse('Bad Request', 400, {
      message: message || 'Invalid request',
      details,
      code: 'BAD_REQUEST',
    }),
}

/**
 * Handle errors in API routes with consistent format
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (error instanceof Error) {
    // Log error in development
    if (isDevelopment) {
      console.error('API Error:', error)
    }

    // Check for known error types
    if (error.message.includes('not found') || error.message.includes('Not Found')) {
      return ApiErrors.NOT_FOUND()
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return ApiErrors.VALIDATION_ERROR(isDevelopment ? { originalError: error.message } : undefined)
    }

    // Return generic error
    return ApiErrors.INTERNAL_SERVER_ERROR(
      isDevelopment ? error.message : undefined
    )
  }

  // Unknown error type
  return ApiErrors.INTERNAL_SERVER_ERROR()
}

