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
    case 'mock':
      return sendMockSMS(phoneNumber, message)
    // Add real SMS providers here:
    // case 'eskiz':
    //   return sendEskizSMS(phoneNumber, message)
    // case 'playmobile':
    //   return sendPlayMobileSMS(phoneNumber, message)
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

export async function sendOTPSMS(
  phoneNumber: string,
  code: string
): Promise<SMSResult> {
  const message = `4Event: Ваш код подтверждения: ${code}. Не сообщайте его никому.`
  return sendSMS(phoneNumber, message)
}
