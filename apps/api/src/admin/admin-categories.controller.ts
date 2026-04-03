import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { AdminCategoriesService } from './admin-categories.service';

@ApiTags('Admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly adminCategoriesService: AdminCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories (including inactive) with children and product counts' })
  async findAll() {
    return this.adminCategoriesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create category' })
  async create(
    @Body()
    body: {
      name: string;
      imageUrl?: string;
      iconName?: string;
      parentCategoryId?: string;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.adminCategoriesService.create(body);
  }

  @Put()
  @ApiOperation({ summary: 'Update category (id in body)' })
  async update(
    @Body()
    body: {
      id: string;
      name?: string;
      imageUrl?: string;
      iconName?: string;
      parentCategoryId?: string;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.adminCategoriesService.update(body);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete category (id in body), prevent if has products' })
  async delete(@Body() body: { id: string }) {
    return this.adminCategoriesService.delete(body);
  }
}
