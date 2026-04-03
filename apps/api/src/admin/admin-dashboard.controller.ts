import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('Admin')
@Controller('admin/dashboard')
@UseGuards(AdminAuthGuard)
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  @Get()
  async getDashboard() {
    const stats = await this.adminDashboardService.getStats();
    return { success: true, data: stats };
  }
}
