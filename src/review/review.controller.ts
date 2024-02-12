import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewDto } from 'src/dto/review.dto'; // Assuming you have a ReviewDto defined
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllReviews(@Req() req) {
    const reviews = await this.reviewService.getAllReviews(req.user.id);
    return reviews;
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getLatestReview(@Req() req) {
    const reviewList = await this.reviewService.getLatestReview(req.user.id);
    return reviewList;
  }

  @Get('fromTo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getReviewsFromTo(
    @Req() req,
    @Query('type') type: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const habitsTrackerList = await this.reviewService.getReviewsFromTo(
      req.user.id,
      type,
      from,
      to,
    );
    return habitsTrackerList;
  }

  @Get('groupedByDate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getReviewsGroupedByDate(
    @Req() req,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<ReviewDto[]> {
    const reviewList = await this.reviewService.getAllReviewsGroupedByDate(
      req.user.id,
      from,
      to,
    );
    return reviewList;
  }

  @Get('getById/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getReviewById(@Req() req, @Param('id') id: number) {
    try {
      const review = await this.reviewService.getReviewById(req.user.id, id);
      return review;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Error fetching review: ${error.message}`);
    }
  }

  @Post()
  @ApiBody({ type: ReviewDto })
  @ApiResponse({ status: 201, description: 'Review created', type: ReviewDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createReview(@Req() req, @Body() body: ReviewDto) {
    const newReview = await this.reviewService.insertReview(req.user.id, body);

    return { message: 'Review created successfully', review: newReview };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateReview(
    @Req() req,
    @Param('id') id: number,
    @Body() updatedReview: ReviewDto,
  ) {
    try {
      const updated = await this.reviewService.updateReview(
        req.user.id,
        id,
        updatedReview,
      );
      return { message: 'Review updated successfully', review: updated };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('remove/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeReview(@Req() req, @Param('id') id: number) {
    try {
      const review = await this.reviewService.removeReview(req.user.id, id);
      return { message: 'Review removed successfully', review };
    } catch (error) {
      // Handle errors
      return { error: error.message };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteReview(@Req() req, @Param('id') id: number) {
    try {
      const deleted = await this.reviewService.deleteReview(req.user.id, id);
      return { message: 'Review deleted successfully', review: deleted };
    } catch (error) {
      return { error: error.message };
    }
  }
}
