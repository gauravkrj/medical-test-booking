import validator from 'validator'
import DOMPurify from 'isomorphic-dompurify'

// Sanitize string input (XSS prevention)
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  // Remove HTML tags and sanitize
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  }).trim()
}

// Sanitize HTML content (for rich text fields)
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') {
    return ''
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: []
  })
}

// Validate and sanitize email
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }
  const trimmed = email.trim().toLowerCase()
  if (!validator.isEmail(trimmed)) {
    return ''
  }
  return trimmed
}

// Validate and sanitize phone
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return ''
  }
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  // Basic validation (10-15 digits)
  if (digits.length < 10 || digits.length > 15) {
    return ''
  }
  return digits
}

// Validate and sanitize URL
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }
  const trimmed = url.trim()
  if (!validator.isURL(trimmed, { require_protocol: true })) {
    return ''
  }
  return trimmed
}

// Validate and sanitize numeric input
export function sanitizeNumber(input: string | number): number | null {
  if (typeof input === 'number') {
    return isNaN(input) ? null : input
  }
  if (typeof input !== 'string') {
    return null
  }
  const num = parseFloat(input)
  return isNaN(num) ? null : num
}

// Validate and sanitize integer
export function sanitizeInteger(input: string | number): number | null {
  const num = sanitizeNumber(input)
  return num !== null && Number.isInteger(num) ? num : null
}

