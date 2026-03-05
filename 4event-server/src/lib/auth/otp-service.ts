import prisma from '@/lib/db'
import crypto from 'crypto'

const OTP_EXPIRY_MINUTES = 5
const MAX_ATTEMPTS = 3

// Test phone numbers that always use fixed OTP code (for testing in production)
// Store without + prefix for consistent comparison
const TEST_PHONE_NUMBERS = [
  '998111111111',
  '998000000000',
]
const TEST_OTP_CODE = '123456'

// Normalize phone number by removing + prefix and any spaces/dashes
function normalizePhoneNumber(phone: string): string {
  return phone.replace(/^\+/, '').replace(/[\s-]/g, '')
}

// Check if a phone number is a test number
function isTestPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone)
  return TEST_PHONE_NUMBERS.includes(normalized)
}

export async function generateOTP(phoneNumber: string): Promise<string> {
  // Clean up expired OTPs
  await prisma.oTP.deleteMany({
    where: {
      phoneNumber,
      OR: [
        { expiresAt: { lt: new Date() } },
        { verified: true }
      ]
    }
  })

  // Generate 6-digit code
  // Use fixed code for test phone numbers or in development
  const isTestPhone = isTestPhoneNumber(phoneNumber)
  const code = (process.env.NODE_ENV === 'development' || isTestPhone)
    ? TEST_OTP_CODE
    : crypto.randomInt(100000, 999999).toString()

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES)

  await prisma.oTP.create({
    data: {
      phoneNumber,
      code,
      expiresAt
    }
  })

  return code
}

export async function verifyOTP(
  phoneNumber: string,
  code: string
): Promise<{ valid: boolean; error?: string }> {
  const otp = await prisma.oTP.findFirst({
    where: {
      phoneNumber,
      verified: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!otp) {
    return { valid: false, error: 'Код не найден или истёк' }
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    return { valid: false, error: 'Превышено количество попыток' }
  }

  if (otp.code !== code) {
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } }
    })
    return { valid: false, error: 'Неверный код' }
  }

  await prisma.oTP.update({
    where: { id: otp.id },
    data: { verified: true }
  })

  return { valid: true }
}
