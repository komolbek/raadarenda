import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { AdminCategoriesService } from './admin-categories.service';

interface CategoryBody {
  name?: string;
  image_url?: string | null;
  icon_name?: string | null;
  parent_category_id?: string | null;
  display_order?: number;
  is_active?: boolean;
}

@ApiTags('Admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly adminCategoriesService: AdminCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories with parent + product/child counts' })
  async findAll() {
    return this.adminCategoriesService.findAll();
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Persist a new category display order' })
  async reorder(@Body() body: { orderedIds: string[] }) {
    return this.adminCategoriesService.reorder(body.orderedIds);
  }

  @Post()
  @ApiOperation({ summary: 'Create category' })
  async create(@Body() body: CategoryBody & { name: string }) {
    return this.adminCategoriesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  async update(@Param('id') id: string, @Body() body: CategoryBody) {
    return this.adminCategoriesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category (returns requires_confirmation if it has products)' })
  async delete(@Param('id') id: string, @Query('force') force?: string) {
    return this.adminCategoriesService.delete(id, force === 'true');
  }
}
