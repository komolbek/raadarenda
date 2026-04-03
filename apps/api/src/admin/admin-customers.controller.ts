import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { AdminCustomersService } from './admin-customers.service';

@ApiTags('Admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private adminCustomersService: AdminCustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers with pagination and search' })
  async listCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminCustomersService.listCustomers({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer details with addresses and recent orders' })
  async getCustomer(@Param('id') id: string) {
    return this.adminCustomersService.getCustomerById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  async updateCustomer(
    @Param('id') id: string,
    @Body() body: { name?: string; is_active?: boolean },
  ) {
    return this.adminCustomersService.updateCustomer(id, body);
  }
}
