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
import { StaffId, StaffRole } from '../common/decorators';
import { AdminStaffService } from './admin-staff.service';

@ApiTags('Admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/staff')
export class AdminStaffController {
  constructor(private adminStaffService: AdminStaffService) {}

  @Get()
  @ApiOperation({ summary: 'List staff members' })
  async listStaff() {
    return this.adminStaffService.listStaff();
  }

  @Post()
  @ApiOperation({ summary: 'Create staff member (OWNER only)' })
  async createStaff(
    @StaffRole() staffRole: string,
    @Body() body: { phoneNumber: string; name: string; role: string; password?: string },
  ) {
    return this.adminStaffService.createStaff(staffRole, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update staff member (OWNER only)' })
  async updateStaff(
    @StaffRole() staffRole: string,
    @Param('id') id: string,
    @Body() body: { name?: string; role?: string; isActive?: boolean },
  ) {
    return this.adminStaffService.updateStaff(staffRole, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete staff member (OWNER only)' })
  async deleteStaff(
    @StaffRole() staffRole: string,
    @StaffId() staffId: string,
    @Param('id') targetId: string,
  ) {
    return this.adminStaffService.deleteStaff(staffRole, staffId, targetId);
  }
}
