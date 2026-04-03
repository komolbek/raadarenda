import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BusinessSettingsService } from './business-settings.service';

@ApiTags('Business')
@Controller('business')
export class BusinessSettingsController {
  constructor(private businessSettingsService: BusinessSettingsService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get business settings and active delivery zones' })
  async getInfo() {
    return this.businessSettingsService.getBusinessInfo();
  }
}
