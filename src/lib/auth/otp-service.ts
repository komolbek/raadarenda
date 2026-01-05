import prisma from '@/lib/db'
import crypto from 'crypto'

const OTP_EXPIRY_MINUTES = 5
const MAX_ATTEMPTS = 3

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
  const code = process.env.NODE_ENV === 'development'
    ? '123456' // Use fixed code in development
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
