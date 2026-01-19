import type { NextApiRequest, NextApiResponse } from 'next'
import { invalidateSession } from '@/lib/auth/session-service'
import { createTranslator } from '@/lib/i18n'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const t = createTranslator(req)

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: t('methodNotAllowed'),
    })
  }

  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      await invalidateSession(token)
    }

    return res.status(200).json({
      success: true,
      message: t('logoutSuccess'),
    })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({
      success: false,
      message: t('internalServerError'),
    })
  }
}
