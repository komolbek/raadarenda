import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'

export interface AuthResult {
  authenticated: boolean
  userId?: string
  error?: string
}

export async function authMiddleware(req: NextApiRequest): Promise<AuthResult> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or invalid authorization header' }
  }

  const token = authHeader.substring(7)

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true }
    })

    if (!session) {
      return { authenticated: false, error: 'Invalid session' }
    }

    if (new Date() > session.expires) {
      await prisma.session.delete({ where: { id: session.id } })
      return { authenticated: false, error: 'Session expired' }
    }

    if (!session.user.isActive) {
      return { authenticated: false, error: 'Account is inactive' }
    }

    return { authenticated: true, userId: session.userId }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return { authenticated: false, error: 'Authentication failed' }
  }
}

type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => Promise<void>

export function withAuth(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const result = await authMiddleware(req)

    if (!result.authenticated || !result.userId) {
      return res.status(401).json({
        success: false,
        message: result.error || 'Unauthorized'
      })
    }

    return handler(req, res, result.userId)
  }
}
