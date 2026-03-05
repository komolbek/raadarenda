import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize, parse } from 'cookie'
import {
  verifyAdminKey,
  createAdminSession,
  validateAdminSession,
  clearAdminSession,
} from '@/lib/auth/admin-middleware'
import { createTranslator } from '@/lib/i18n'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const t = createTranslator(req)

  // Login
  if (req.method === 'POST') {
    const { api_key } = req.body

    if (!api_key || !verifyAdminKey(api_key)) {
      return res.status(401).json({
        success: false,
        message: t('adminInvalidKey'),
      })
    }

    const sessionToken = createAdminSession()

    res.setHeader(
      'Set-Cookie',
      serialize('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
    )

    return res.status(200).json({
      success: true,
      message: t('adminLoginSuccess'),
    })
  }

  // Check session
  if (req.method === 'GET') {
    const cookies = parse(req.headers.cookie || '')
    const sessionToken = cookies.admin_session

    if (!sessionToken || !validateAdminSession(sessionToken)) {
      return res.status(401).json({
        success: false,
        message: t('unauthorized'),
      })
    }

    return res.status(200).json({
      success: true,
      authenticated: true,
    })
  }

  // Logout
  if (req.method === 'DELETE') {
    const cookies = parse(req.headers.cookie || '')
    const sessionToken = cookies.admin_session

    if (sessionToken) {
      clearAdminSession(sessionToken)
    }

    res.setHeader(
      'Set-Cookie',
      serialize('admin_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      })
    )

    return res.status(200).json({
      success: true,
      message: t('logoutSuccess'),
    })
  }

  return res.status(405).json({
    success: false,
    message: t('methodNotAllowed'),
  })
}
