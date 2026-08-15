import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { SetsService } from './sets.service';

interface SetBody {
  name?: string;
  name_uz?: string | null;
  name_en?: string | null;
  description?: string | null;
  description_uz?: string | null;
  description_en?: string | null;
  photos?: string[];
  is_active?: boolean;
  display_order?: number;
  items?: { product_id: string; quantity?: number }[];
}

@ApiTags('Admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/sets')
export class AdminSetsController {
  constructor(private readonly setsService: SetsService) {}

  @Get()
  @ApiOperation({ summary: 'List all sets' })
  async findAll() { return this.setsService.findAll(); }

  @Post('reorder')
  @ApiOperation({ summary: 'Persist a new set display order' })
  async reorder(@Body() body: { orderedIds: string[] }) {
    return this.setsService.reorder(body.orderedIds);
  }

  @Post()
  @ApiOperation({ summary: 'Create set' })
  async create(@Body() body: SetBody) { return this.setsService.create(body); }

  @Get(':id')
  @ApiOperation({ summary: 'Get set' })
  async findOne(@Param('id') id: string) { return this.setsService.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update set' })
  async update(@Param('id') id: string, @Body() body: SetBody) {
    return this.setsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete set' })
  async delete(@Param('id') id: string) { return this.setsService.delete(id); }
}
