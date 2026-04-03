import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { UserAuthGuard } from '../common/guards/user-auth.guard';
import { UserId } from '../common/decorators';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(UserAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a review for a product' })
  async createReview(
    @UserId() userId: string,
    @Body()
    body: {
      product_id: string;
      rating: number;
      comment?: string;
      photos?: string[];
    },
  ) {
    return this.reviewsService.createReview(userId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update own review' })
  async updateReview(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body()
    body: {
      rating?: number;
      comment?: string;
      photos?: string[];
    },
  ) {
    return this.reviewsService.updateReview(userId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete own review' })
  async deleteReview(
    @UserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.reviewsService.deleteReview(userId, id);
  }
}
