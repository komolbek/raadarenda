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
import { AdminSmsTemplatesService } from './admin-sms-templates.service';

@ApiTags('Admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/sms-templates')
export class AdminSmsTemplatesController {
  constructor(private adminSmsTemplatesService: AdminSmsTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all SMS templates' })
  async listTemplates() {
    return this.adminSmsTemplatesService.listTemplates();
  }

  @Post()
  @ApiOperation({ summary: 'Create SMS template' })
  async createTemplate(
    @Body()
    body: {
      slug: string;
      name: string;
      bodyRu: string;
      bodyUz?: string;
      bodyEn?: string;
      variables?: string[];
      isActive?: boolean;
    },
  ) {
    return this.adminSmsTemplatesService.createTemplate(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update SMS template' })
  async updateTemplate(
    @Param('id') id: string,
    @Body()
    body: {
      slug?: string;
      name?: string;
      bodyRu?: string;
      bodyUz?: string;
      bodyEn?: string;
      variables?: string[];
      isActive?: boolean;
    },
  ) {
    return this.adminSmsTemplatesService.updateTemplate(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete SMS template' })
  async deleteTemplate(@Param('id') id: string) {
    return this.adminSmsTemplatesService.deleteTemplate(id);
  }
}
