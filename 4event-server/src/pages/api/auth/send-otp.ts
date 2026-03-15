import type { NextApiRequest, NextApiResponse } from 'next'
import { generateOTP, isTestAuthEnabled } from '@/lib/auth/otp-service'
import { sendOTPSMS } from '@/lib/auth/sms-service'
import { createTranslator } from '@/lib/i18n'
import { logRequest, logResponse } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limit'
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

    // Rate limit: max 3 OTP requests per phone per 5 minutes
    const phoneLimit = checkRateLimit(
      { namespace: 'otp-phone', maxRequests: 3, windowMs: 5 * 60 * 1000 },
      phoneNumber
    )
    if (!phoneLimit.allowed) {
      logResponse(req, 429, startTime, 'Rate limited (phone)')
      return res.status(429).json({
        success: false,
        message: t('tooManyRequests'),
        retry_after_seconds: Math.ceil(phoneLimit.retryAfterMs / 1000),
      })
    }

    // Rate limit: max 10 OTP requests per IP per 15 minutes
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
    const ipLimit = checkRateLimit(
      { namespace: 'otp-ip', maxRequests: 10, windowMs: 15 * 60 * 1000 },
      ip
    )
    if (!ipLimit.allowed) {
      logResponse(req, 429, startTime, 'Rate limited (IP)')
      return res.status(429).json({
        success: false,
        message: t('tooManyRequests'),
        retry_after_seconds: Math.ceil(ipLimit.retryAfterMs / 1000),
      })
    }

    console.log(`   📱 Phone: ${phoneNumber}`)

    const code = await generateOTP(phoneNumber)
    console.log(`   🔢 OTP generated for ${phoneNumber}`)

    await sendOTPSMS(phoneNumber, code)

    logResponse(req, 200, startTime)
    return res.status(200).json({
      success: true,
      message: t('otpSent'),
      // Only return the code when test auth is explicitly enabled
      ...(isTestAuthEnabled() && { dev_code: code }),
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
