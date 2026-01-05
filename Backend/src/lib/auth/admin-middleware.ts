import { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'cookie'
import crypto from 'crypto'

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Use a secret key for signing session tokens
function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_KEY
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET or ADMIN_API_KEY must be configured')
  }
  return secret
}

export function verifyAdminKey(apiKey: string): boolean {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) {
    console.error('ADMIN_API_KEY not configured')
    return false
  }
  return apiKey === adminKey
}

// Create a signed session token with embedded timestamp
export function createAdminSession(): string {
  const timestamp = Date.now()
  const payload = `admin:${timestamp}`
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('hex')
  return `${payload}:${signature}`
}

// Validate session token by verifying signature and checking expiry
export function validateAdminSession(sessionToken: string): boolean {
  if (!sessionToken) return false

  const parts = sessionToken.split(':')
  if (parts.length !== 3) return false

  const [prefix, timestampStr, signature] = parts
  if (prefix !== 'admin') return false

  const timestamp = parseInt(timestampStr, 10)
  if (isNaN(timestamp)) return false

  // Check if session has expired
  const elapsed = Date.now() - timestamp
  if (elapsed > SESSION_DURATION) return false

  // Verify signature
  const payload = `${prefix}:${timestampStr}`
  const expectedSignature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export function clearAdminSession(_sessionToken: string): void {
  // With signed tokens, clearing is handled by cookie deletion on the client
  // Nothing to do server-side
}

type AdminApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>

export function requireAdminAuth(handler: AdminApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = parse(req.headers.cookie || '')
    const sessionToken = cookies.admin_session

    if (!sessionToken || !validateAdminSession(sessionToken)) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      })
    }

    return handler(req, res)
  }
}
