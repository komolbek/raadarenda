import { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'cookie'

// In-memory session storage (use Redis in production)
const adminSessions = new Map<string, { createdAt: Date }>()

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export function verifyAdminKey(apiKey: string): boolean {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) {
    console.error('ADMIN_API_KEY not configured')
    return false
  }
  return apiKey === adminKey
}

export function createAdminSession(): string {
  const token = crypto.randomUUID()
  adminSessions.set(token, { createdAt: new Date() })
  return token
}

export function validateAdminSession(sessionToken: string): boolean {
  const session = adminSessions.get(sessionToken)
  if (!session) return false

  const now = new Date()
  const elapsed = now.getTime() - session.createdAt.getTime()

  if (elapsed > SESSION_DURATION) {
    adminSessions.delete(sessionToken)
    return false
  }

  return true
}

export function clearAdminSession(sessionToken: string): void {
  adminSessions.delete(sessionToken)
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
