import { createHash, randomBytes } from 'crypto'

// Generate CSRF token
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

// Create CSRF token hash
export function createCSRFTokenHash(token: string, secret: string): string {
  return createHash('sha256').update(token + secret).digest('hex')
}

// Verify CSRF token
export function verifyCSRFToken(token: string, hash: string, secret: string): boolean {
  const expectedHash = createCSRFTokenHash(token, secret)
  return hash === expectedHash
}

// Get CSRF secret from environment
export function getCSRFSecret(): string {
  const secret = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('CSRF_SECRET or NEXTAUTH_SECRET must be set')
  }
  return secret
}

