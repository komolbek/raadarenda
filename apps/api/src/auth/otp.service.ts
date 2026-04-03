import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

function normalizePhoneNumber(phone: string): string {
  return phone.replace(/^\+/, '').replace(/[\s-]/g, '');
}

function isTestPhoneNumber(phone: string): boolean {
  if (process.env.ENABLE_TEST_AUTH !== 'true') return false;
  const testPhones = process.env.TEST_PHONE_NUMBERS;
  if (!testPhones) return false;
  const normalized = normalizePhoneNumber(phone);
  return testPhones.split(',').map((p) => p.trim()).includes(normalized);
}

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  isTestAuthEnabled(): boolean {
    return process.env.ENABLE_TEST_AUTH === 'true';
  }

  async generate(phoneNumber: string): Promise<string> {
    await this.prisma.oTP.deleteMany({
      where: {
        phoneNumber,
        OR: [{ expiresAt: { lt: new Date() } }, { verified: true }],
      },
    });

    const testOtp = process.env.TEST_OTP_CODE || '';
    const code =
      isTestPhoneNumber(phoneNumber) && testOtp
        ? testOtp
        : crypto.randomInt(100000, 999999).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    await this.prisma.oTP.create({
      data: { phoneNumber, code, expiresAt },
    });

    return code;
  }

  async verify(
    phoneNumber: string,
    code: string,
  ): Promise<{ valid: boolean; error?: string }> {
    const otp = await this.prisma.oTP.findFirst({
      where: {
        phoneNumber,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      return { valid: false, error: 'Код не найден или истёк' };
    }

    if (otp.attempts >= MAX_ATTEMPTS) {
      return { valid: false, error: 'Превышено количество попыток' };
    }

    const codeMatch =
      otp.code.length === code.length &&
      crypto.timingSafeEqual(Buffer.from(otp.code), Buffer.from(code));

    if (!codeMatch) {
      await this.prisma.oTP.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      return { valid: false, error: 'Неверный код' };
    }

    await this.prisma.oTP.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    return { valid: true };
  }
}
