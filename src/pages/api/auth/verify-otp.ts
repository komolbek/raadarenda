import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'
import { verifyOTP } from '@/lib/auth/otp-service'
import { createSession } from '@/lib/auth/session-service'
import { createTranslator } from '@/lib/i18n'
import { logRequest, logResponse } from '@/lib/logger'
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
  const startTime = Date.now()
  const t = createTranslator(req)

  logRequest(req)

  if (req.method !== 'POST') {
    logResponse(req, 405, startTime, 'Method not allowed')
    return res.status(405).json({
      success: false,
      message: t('methodNotAllowed'),
    })
  }

  try {
    const body = schema.parse(req.body)

    console.log(`   📱 Phone: ${body.phone_number}`)
    console.log(`   🔑 Code: ${body.code.substring(0, 2)}****`)

    // Verify OTP
    const otpResult = await verifyOTP(body.phone_number, body.code)
    if (!otpResult.valid) {
      console.log(`   ❌ OTP verification failed: ${otpResult.error}`)
      logResponse(req, 400, startTime, otpResult.error)
      return res.status(400).json({
        success: false,
        message: otpResult.error || t('otpInvalid'),
      })
    }

    console.log(`   ✅ OTP verified successfully`)

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phoneNumber: body.phone_number },
    })

    if (!user) {
      console.log(`   👤 Creating new user`)
      user = await prisma.user.create({
        data: {
          phoneNumber: body.phone_number,
        },
      })
    } else {
      console.log(`   👤 Existing user: ${user.id}`)
    }

    // Create session
    const sessionToken = await createSession(
      user.id,
      body.device_id,
      req.headers['user-agent']
    )

    console.log(`   🎫 Session created for user ${user.id}`)

    logResponse(req, 200, startTime)
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
      logResponse(req, 400, startTime, 'Validation error')
      return res.status(400).json({
        success: false,
        message: t('validationError'),
        errors: error.errors,
      })
    }

    console.error('Verify OTP error:', error)
    logResponse(req, 500, startTime, error instanceof Error ? error.message : 'Unknown error')
    return res.status(500).json({
      success: false,
      message: t('internalServerError'),
    })
  }
}
