import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../common/prisma.service';
import { RateLimitService } from '../common/rate-limit.service';
import { OtpService } from '../auth/otp.service';
import { SmsService } from '../auth/sms.service';
import { createAdminSession } from '../common/guards/admin-auth.guard';

interface ResetTokenEntry {
  staffId: string;
  phone: string;
  expiresAt: number;
}

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);
  private resetTokens = new Map<string, ResetTokenEntry>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimitService: RateLimitService,
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
  ) {}

  async login(
    phone: string,
    password: string,
  ): Promise<{
    sessionToken: string;
    staff: { id: string; name: string; role: string; phoneNumber: string };
    mustChangePassword: boolean;
  }> {
    const rateCheck = this.rateLimitService.check(
      'admin_login',
      phone,
      5,
      15 * 60 * 1000,
    );
    if (!rateCheck.allowed) {
      throw new HttpException(
        `Too many login attempts. Try again in ${Math.ceil(rateCheck.retryAfterMs / 1000)} seconds`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const staff = await this.prisma.staff.findUnique({
      where: { phoneNumber: phone },
    });

    if (!staff || !staff.isActive || staff.deletedAt) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    if (!staff.passwordHash) {
      throw new UnauthorizedException(
        'Password not set. Use "Forgot password" to receive an SMS code and set one.',
      );
    }

    const passwordValid = await bcrypt.compare(password, staff.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const sessionToken = createAdminSession(staff.id);

    await this.prisma.staff.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      sessionToken,
      staff: {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        phoneNumber: staff.phoneNumber,
      },
      mustChangePassword: staff.mustChangePassword,
    };
  }

  async getStaffById(staffId: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async setPassword(
    staffId: string,
    newPassword: string,
    currentPassword?: string,
  ): Promise<void> {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (!staff.mustChangePassword && staff.passwordHash) {
      if (!currentPassword) {
        throw new BadRequestException('Current password is required');
      }
      const valid = await bcrypt.compare(currentPassword, staff.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    if (newPassword.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.staff.update({
      where: { id: staffId },
      data: { passwordHash, mustChangePassword: false },
    });
  }

  async forgotPasswordSendOtp(phone: string): Promise<void> {
    this.logger.log(`[forgot-password] send-otp requested for ${phone}`);

    const staff = await this.prisma.staff.findUnique({
      where: { phoneNumber: phone },
    });

    if (!staff) {
      this.logger.warn(`[forgot-password] no staff record for ${phone}; silently returning`);
      return;
    }
    if (!staff.isActive || staff.deletedAt) {
      this.logger.warn(
        `[forgot-password] staff ${staff.id} is inactive or soft-deleted (isActive=${staff.isActive}, deletedAt=${staff.deletedAt?.toISOString() ?? 'null'}); silently returning`,
      );
      return;
    }

    const code = await this.otpService.generate(phone);
    const result = await this.smsService.sendAdminOTP(phone, code);
    this.logger.log(
      `[forgot-password] OTP dispatched to ${phone} via ${process.env.SMS_PROVIDER || 'mock'} (success=${result.success}${result.error ? `, error=${result.error}` : ''})`,
    );
  }

  async forgotPasswordVerifyOtp(
    phone: string,
    code: string,
  ): Promise<{ resetToken: string }> {
    const staff = await this.prisma.staff.findUnique({
      where: { phoneNumber: phone },
    });

    if (!staff || !staff.isActive || staff.deletedAt) {
      throw new BadRequestException('Invalid request');
    }

    const result = await this.otpService.verify(phone, code);
    if (!result.valid) {
      throw new BadRequestException(result.error || 'Invalid OTP');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.resetTokens.set(resetToken, {
      staffId: staff.id,
      phone,
      expiresAt,
    });

    // Cleanup expired tokens
    this.cleanupExpiredTokens();

    return { resetToken };
  }

  async resetPasswordWithToken(
    resetToken: string,
    newPassword: string,
  ): Promise<void> {
    const entry = this.resetTokens.get(resetToken);

    if (!entry || entry.expiresAt < Date.now()) {
      this.resetTokens.delete(resetToken);
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.staff.update({
      where: { id: entry.staffId },
      data: { passwordHash, mustChangePassword: false },
    });

    this.resetTokens.delete(resetToken);
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, entry] of this.resetTokens.entries()) {
      if (entry.expiresAt < now) {
        this.resetTokens.delete(token);
      }
    }
  }
}
