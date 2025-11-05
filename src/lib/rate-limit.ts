// Simple in-memory rate limiter
// For production with Redis, replace with @upstash/ratelimit + Redis

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class SimpleRateLimiter {
  private store: RateLimitStore = {}
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, window: string) {
    this.maxRequests = maxRequests
    // Parse window string (e.g., '15 m', '1 h', '1 m')
    const windowMatch = window.match(/(\d+)\s*(m|h|s)/)
    if (!windowMatch) {
      throw new Error('Invalid window format')
    }
    const value = parseInt(windowMatch[1])
    const unit = windowMatch[2]
    const multipliers: Record<string, number> = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000 }
    this.windowMs = value * multipliers[unit]
  }

  async limit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now()
    const key = identifier
    const record = this.store[key]

    // Clean expired entries periodically (simple cleanup)
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      Object.keys(this.store).forEach((k) => {
        if (this.store[k].resetTime < now) {
          delete this.store[k]
        }
      })
    }

    if (!record || record.resetTime < now) {
      // New window
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs,
      }
    }

    if (record.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: record.resetTime,
      }
    }

    record.count++
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.count,
      reset: record.resetTime,
    }
  }
}

// Rate limiters for different endpoints
export const authRateLimit = new SimpleRateLimiter(5, '15 m') // 5 requests per 15 minutes
export const bookingRateLimit = new SimpleRateLimiter(10, '1 h') // 10 requests per hour
export const adminRateLimit = new SimpleRateLimiter(100, '1 h') // 100 requests per hour
export const apiRateLimit = new SimpleRateLimiter(60, '1 m') // 60 requests per minute

// Helper function to get identifier from request
export function getRateLimitIdentifier(request: Request): string {
  // Try to get IP from headers
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown'
  return ip
}

