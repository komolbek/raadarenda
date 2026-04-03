import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { AdminProductsService } from './admin-products.service';

@ApiTags('Admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products with pagination, search, category filter' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category_id', required: false, type: String })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category_id') categoryId?: string,
  ) {
    return this.adminProductsService.findAll({ page, limit, search, categoryId });
  }

  @Post()
  @ApiOperation({ summary: 'Create product with specs, pricing tiers, quantity pricing' })
  async create(
    @Body()
    body: {
      name: string;
      description?: string;
      categoryId: string;
      photos?: string[];
      dailyPrice: number;
      totalStock?: number;
      isActive?: boolean;
      specWidth?: string;
      specHeight?: string;
      specDepth?: string;
      specWeight?: string;
      specColor?: string;
      specMaterial?: string;
      minRentalDays?: number;
      maxRentalDays?: number;
      depositAmount?: number;
      pricingTiers?: { days: number; totalPrice: number }[];
      quantityPricing?: { quantity: number; totalPrice: number }[];
    },
  ) {
    return this.adminProductsService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single product' })
  async findOne(@Param('id') id: string) {
    return this.adminProductsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      categoryId?: string;
      photos?: string[];
      dailyPrice?: number;
      totalStock?: number;
      isActive?: boolean;
      specWidth?: string;
      specHeight?: string;
      specDepth?: string;
      specWeight?: string;
      specColor?: string;
      specMaterial?: string;
      minRentalDays?: number;
      maxRentalDays?: number;
      depositAmount?: number;
      pricingTiers?: { days: number; totalPrice: number }[];
      quantityPricing?: { quantity: number; totalPrice: number }[];
    },
  ) {
    return this.adminProductsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (soft if has orders, hard if no orders)' })
  async delete(@Param('id') id: string) {
    return this.adminProductsService.delete(id);
  }
}
