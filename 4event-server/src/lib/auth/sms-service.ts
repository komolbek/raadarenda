// SMS Service - Mock implementation for development
// Replace with actual SMS provider (Eskiz, PlayMobile, etc.) in production

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<SMSResult> {
  const provider = process.env.SMS_PROVIDER || 'mock'

  switch (provider) {
    case 'eskiz':
      return sendEskizSMS(phoneNumber, message)
    case 'mock':
      return sendMockSMS(phoneNumber, message)
    default:
      return sendMockSMS(phoneNumber, message)
  }
}

async function sendMockSMS(
  phoneNumber: string,
  message: string
): Promise<SMSResult> {
  // In development, just log the message
  console.log(`📱 [MOCK SMS] To: ${phoneNumber}`)
  console.log(`📱 [MOCK SMS] Message: ${message}`)

  return {
    success: true,
    messageId: `mock_${Date.now()}`
  }
}

async function sendEskizSMS(
  phoneNumber: string,
  message: string
): Promise<SMSResult> {
  const token = process.env.ESKIZ_API_TOKEN
  if (!token) {
    console.error('ESKIZ_API_TOKEN not configured')
    return { success: false, error: 'SMS provider not configured' }
  }

  try {
    // Remove + prefix for Eskiz API
    const phone = phoneNumber.replace(/^\+/, '')

    const response = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile_phone: phone,
        message,
        from: process.env.SMS_SENDER || '4210',
      }),
    })

    const data = await response.json()

    if (response.ok && data.status === 'waiting') {
      return { success: true, messageId: data.id?.toString() }
    }

    return { success: false, error: data.message || 'SMS sending failed' }
  } catch (error) {
    console.error('Eskiz SMS error:', error)
    return { success: false, error: 'SMS sending failed' }
  }
}

// User OTP SMS (for customer auth)
export async function sendOTPSMS(
  phoneNumber: string,
  code: string
): Promise<SMSResult> {
  const message = `4Event: Ваш код подтверждения: ${code}. Не сообщайте его никому.`
  return sendSMS(phoneNumber, message)
}

// Admin password reset OTP SMS (Eskiz-compliant template)
export async function sendAdminOTPSMS(
  phoneNumber: string,
  code: string
): Promise<SMSResult> {
  const message = `Kod dlya vosstanovleniya parolya na platforme 4Event: ${code}. Nikomu ne soobshchayte etot kod.`
  return sendSMS(phoneNumber, message)
}
