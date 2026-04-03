import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { AdminDeliveryZonesService } from './admin-delivery-zones.service';

@ApiTags('Admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/delivery-zones')
export class AdminDeliveryZonesController {
  constructor(private adminDeliveryZonesService: AdminDeliveryZonesService) {}

  @Get()
  @ApiOperation({ summary: 'List all delivery zones' })
  async listZones() {
    return this.adminDeliveryZonesService.listZones();
  }

  @Post()
  @ApiOperation({ summary: 'Create delivery zone' })
  async createZone(
    @Body() body: { name: string; price?: number; isFree?: boolean; isActive?: boolean },
  ) {
    return this.adminDeliveryZonesService.createZone(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update delivery zone' })
  async updateZone(
    @Param('id') id: string,
    @Body() body: { name?: string; price?: number; isFree?: boolean; isActive?: boolean },
  ) {
    return this.adminDeliveryZonesService.updateZone(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete delivery zone' })
  async deleteZone(@Param('id') id: string) {
    return this.adminDeliveryZonesService.deleteZone(id);
  }
}
