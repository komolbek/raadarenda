import type { NextApiRequest, NextApiResponse } from 'next'
import { generateOTP } from '@/lib/auth/otp-service'
import { sendOTPSMS } from '@/lib/auth/sms-service'
import { createTranslator } from '@/lib/i18n'
import { z } from 'zod'

const schema = z.object({
  phone_number: z.string().regex(/^\+998\d{9}$/, 'Invalid phone number format'),
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
    const phoneNumber = body.phone_number

    const code = await generateOTP(phoneNumber)
    await sendOTPSMS(phoneNumber, code)

    return res.status(200).json({
      success: true,
      message: t('otpSent'),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: t('validationError'),
        errors: error.errors,
      })
    }

    console.error('Send OTP error:', error)
    return res.status(500).json({
      success: false,
      message: t('internalServerError'),
    })
  }
}
