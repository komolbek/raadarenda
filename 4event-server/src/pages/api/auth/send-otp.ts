import type { NextApiRequest, NextApiResponse } from 'next'
import { generateOTP } from '@/lib/auth/otp-service'
import { sendOTPSMS } from '@/lib/auth/sms-service'
import { createTranslator } from '@/lib/i18n'
import { logRequest, logResponse } from '@/lib/logger'
import { z } from 'zod'

const schema = z.object({
  phone_number: z.string().regex(/^\+998\d{9}$/, 'Invalid phone number format'),
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
    const phoneNumber = body.phone_number

    console.log(`   📱 Phone: ${phoneNumber}`)

    const code = await generateOTP(phoneNumber)
    console.log(`   🔢 OTP generated for ${phoneNumber}`)

    await sendOTPSMS(phoneNumber, code)

    logResponse(req, 200, startTime)
    return res.status(200).json({
      success: true,
      message: t('otpSent'),
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

    console.error('Send OTP error:', error)
    logResponse(req, 500, startTime, error instanceof Error ? error.message : 'Unknown error')
    return res.status(500).json({
      success: false,
      message: t('internalServerError'),
    })
  }
}
