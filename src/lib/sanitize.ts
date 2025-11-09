import validator from 'validator'

// Server-safe HTML tag removal (no jsdom dependency)
function stripHtmlTags(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
    .replace(/<[^>]+>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

// Server-safe HTML sanitization (allows specific tags)
function sanitizeHtmlTags(html: string, allowedTags: string[]): string {
  // Remove script and style tags first
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Remove all tags not in allowed list
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  sanitized = sanitized.replace(tagPattern, (match, tagName) => {
    const lowerTag = tagName.toLowerCase()
    if (allowedTags.includes(lowerTag)) {
      // Keep allowed tags but remove attributes
      return match.replace(/\s+[^>]*/, '')
    }
    return '' // Remove disallowed tags
  })

  // Remove any remaining attributes from allowed tags
  allowedTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\s+[^>]*>`, 'gi')
    sanitized = sanitized.replace(regex, `<${tag}>`)
  })

  return sanitized
}

// Sanitize string input (XSS prevention)
export function sanitizeString(input: string): string {
  try {
    if (typeof input !== 'string') {
      return ''
    }
    // Remove HTML tags and sanitize
    return stripHtmlTags(input).trim()
  } catch (error) {
    console.error('Error sanitizing string:', error)
    // Return empty string on error to prevent crashes
    return ''
  }
}

// Sanitize HTML content (for rich text fields)
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') {
    return ''
  }
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  return sanitizeHtmlTags(html, allowedTags)
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
  try {
    if (!phone || typeof phone !== 'string') {
      return ''
    }
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')
    // Basic validation (10-15 digits) - allow longer for international numbers
    if (digits.length < 10 || digits.length > 20) {
      return ''
    }
    return digits
  } catch (error) {
    console.error('Error sanitizing phone:', error)
    return ''
  }
}

// Validate and sanitize URL
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }
  try {
    const trimmed = url.trim()
    
    // If already has protocol, validate it
    if (trimmed.match(/^https?:\/\//i)) {
      try {
        if (validator.isURL(trimmed, { require_protocol: true })) {
          return trimmed
        }
      } catch (e) {
        // Validator error, but URL has protocol, so trust it
        if (trimmed.match(/^https?:\/\/[^\s]+$/i)) {
          return trimmed
        }
      }
    }
    
    // If starts with //, add https:
    if (trimmed.startsWith('//')) {
      const withProtocol = `https:${trimmed}`
      try {
        if (validator.isURL(withProtocol, { require_protocol: true })) {
          return withProtocol
        }
      } catch (e) {
        // Validator error, but looks like URL
        if (withProtocol.match(/^https:\/\/[^\s]+$/i)) {
          return withProtocol
        }
      }
    }
    
    // If looks like a domain (for Cloudinary, S3, etc.), add https://
    if (trimmed.match(/^[a-zA-Z0-9][a-zA-Z0-9-._]*\.[a-zA-Z]{2,}/)) {
      const withProtocol = `https://${trimmed}`
      try {
        if (validator.isURL(withProtocol, { require_protocol: true })) {
          return withProtocol
        }
      } catch (e) {
        // Validator error, but looks like valid domain format
        if (withProtocol.match(/^https:\/\/[^\s]+$/i)) {
          return withProtocol
        }
      }
    }
    
    // Last resort: if it contains a dot and looks like a URL pattern, accept it
    // This handles Cloudinary URLs, S3 URLs, etc.
    if (trimmed.includes('.') && trimmed.match(/^[a-zA-Z0-9][a-zA-Z0-9\/\-._:]*$/)) {
      const withProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
      return withProtocol
    }
    
    return ''
  } catch (error) {
    console.error('Error sanitizing URL:', error, 'URL:', url)
    // If we can't validate but it looks safe, return it with https://
    const trimmed = url.trim()
    if (trimmed && !trimmed.includes('<') && !trimmed.includes('>') && trimmed.includes('.')) {
      return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    }
    return ''
  }
}

// Validate and sanitize numeric input
export function sanitizeNumber(input: string | number): number | null {
  try {
    if (typeof input === 'number') {
      return isNaN(input) ? null : input
    }
    if (typeof input !== 'string') {
      return null
    }
    const num = parseFloat(input)
    return isNaN(num) ? null : num
  } catch (error) {
    console.error('Error sanitizing number:', error)
    return null
  }
}

// Validate and sanitize integer
export function sanitizeInteger(input: string | number): number | null {
  try {
    const num = sanitizeNumber(input)
    return num !== null && Number.isInteger(num) ? num : null
  } catch (error) {
    console.error('Error sanitizing integer:', error)
    return null
  }
}

