import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';
import { SmsService } from './sms.service';
import { RateLimitService } from '../common/rate-limit.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private sessionService: SessionService,
    private smsService: SmsService,
    private rateLimitService: RateLimitService,
  ) {}

  async sendOtp(phoneNumber: string, ip: string) {
    // Rate limit by phone
    const phoneLimit = this.rateLimitService.check('otp_phone', phoneNumber, 3, 5 * 60 * 1000);
    if (!phoneLimit.allowed) {
      throw new HttpException('Слишком много запросов. Попробуйте позже.', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Rate limit by IP
    const ipLimit = this.rateLimitService.check('otp_ip', ip, 10, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      throw new HttpException('Слишком много запросов. Попробуйте позже.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = await this.otpService.generate(phoneNumber);
    const smsResult = await this.smsService.sendOTP(phoneNumber, code);

    if (!smsResult.success) {
      throw new BadRequestException('Не удалось отправить SMS');
    }

    return { success: true, message: 'Код отправлен' };
  }

  async verifyOtp(phoneNumber: string, code: string, deviceId: string) {
    const result = await this.otpService.verify(phoneNumber, code);

    if (!result.valid) {
      throw new BadRequestException(result.error || 'Неверный код');
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { phoneNumber },
      });
    }

    const token = await this.sessionService.create(user.id, deviceId);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        phone_number: user.phoneNumber,
        name: user.name,
        created_at: user.createdAt.toISOString(),
      },
    };
  }

  async logout(token: string) {
    await this.sessionService.invalidate(token);
    return { success: true, message: 'Logged out' };
  }
}
