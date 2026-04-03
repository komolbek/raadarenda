import {
  Controller,
  Get,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { SmsService } from '../auth/sms.service';

@ApiTags('Admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/dev-otp')
export class AdminDevOtpController {
  constructor(private smsService: SmsService) {}

  @Get()
  @ApiOperation({ summary: 'Get dev OTP log (mock mode only)' })
  async getDevOtpLog() {
    if (!this.smsService.isMockMode()) {
      throw new ForbiddenException('Dev OTP log is only available in mock mode');
    }

    return { entries: this.smsService.getDevOTPLog() };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear dev OTP log (mock mode only)' })
  async clearDevOtpLog() {
    if (!this.smsService.isMockMode()) {
      throw new ForbiddenException('Dev OTP log is only available in mock mode');
    }

    this.smsService.clearDevOTPLog();

    return { success: true };
  }
}
