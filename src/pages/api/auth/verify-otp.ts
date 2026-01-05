import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'
import { verifyOTP } from '@/lib/auth/otp-service'
import { createSession } from '@/lib/auth/session-service'
import { createTranslator } from '@/lib/i18n'
import { z } from 'zod'

const schema = z.object({
  phone_number: z.string().regex(/^\+998\d{9}$/, 'Invalid phone number format'),
  code: z.string().length(6, 'Code must be 6 digits'),
  device_id: z.string().min(1, 'Device ID required'),
})

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
    const body = schema.parse(req.body)

    // Verify OTP
    const otpResult = await verifyOTP(body.phone_number, body.code)
    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        message: otpResult.error || t('otpInvalid'),
      })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phoneNumber: body.phone_number },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber: body.phone_number,
        },
      })
    }

    // Create session
    const sessionToken = await createSession(
      user.id,
      body.device_id,
      req.headers['user-agent']
    )

    return res.status(200).json({
      success: true,
      message: t('loginSuccess'),
      data: {
        user: {
          id: user.id,
          phone_number: user.phoneNumber,
          name: user.name,
          created_at: user.createdAt,
        },
        session_token: sessionToken,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: t('validationError'),
        errors: error.errors,
      })
    }

    console.error('Verify OTP error:', error)
    return res.status(500).json({
      success: false,
      message: t('internalServerError'),
    })
  }
}
