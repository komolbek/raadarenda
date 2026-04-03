import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SmsService } from './sms.service';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';
import { RateLimitService } from '../common/rate-limit.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SmsService, OtpService, SessionService, RateLimitService],
  exports: [AuthService, SmsService, OtpService, SessionService],
})
export class AuthModule {}
