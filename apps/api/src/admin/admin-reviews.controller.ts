import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { AdminReviewsService } from './admin-reviews.service';

@ApiTags('Admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly adminReviewsService: AdminReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List all reviews with pagination, filter by product/visibility/rating' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'product_id', required: false, type: String })
  @ApiQuery({ name: 'is_visible', required: false, type: String })
  @ApiQuery({ name: 'rating', required: false, type: Number })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('product_id') productId?: string,
    @Query('is_visible') isVisible?: string,
    @Query('rating') rating?: string,
  ) {
    return this.adminReviewsService.findAll({
      page,
      limit,
      productId,
      isVisible,
      rating: rating ? parseInt(rating, 10) : undefined,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Toggle review visibility' })
  async toggleVisibility(
    @Param('id') id: string,
    @Body() body: { isVisible: boolean },
  ) {
    return this.adminReviewsService.toggleVisibility(id);
  }
}
