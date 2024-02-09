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
  } from '@nestjs/common';
  import { ReviewService } from './review.service';
  import { ReviewDto } from 'src/dto/review.dto'; // Assuming you have a ReviewDto defined
  import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
  
  @ApiTags('Review')
  @Controller('review')
  export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}
  
    @Get()
    async getAllReviews() {
      const reviews = await this.reviewService.getAllReviews();
      return reviews;
    }
  
    @Get('latest')
    async getLatestReview() {
      const reviewList = await this.reviewService.getLatestReview();
      return reviewList;
    }
  
    @Get('fromTo')
    async getReviewsFromTo(@Query('type') type: string, @Query('from') from: string, @Query('to') to: string) {
      const habitsTrackerList = await this.reviewService.getReviewsFromTo(type, from, to);
      return habitsTrackerList;
    }
  
    @Get('groupedByDate')
    async getReviewsGroupedByDate(
      @Query('from') from: string,
      @Query('to') to: string,
    ): Promise<ReviewDto[]> {
      const reviewList = await this.reviewService.getAllReviewsGroupedByDate(from, to);
      return reviewList;
    }
  
    @Get('getById/:id')
    async getReviewById(@Param('id') id: number) {
      try {
        const review = await this.reviewService.getReviewById(id);
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
    async createReview(@Body() body: ReviewDto) {
      const newReview = await this.reviewService.insertReview(body);
  
      return { message: 'Review created successfully', review: newReview };
    }
  
    @Put(':id')
    async updateReview(@Param('id') id: number, @Body() updatedReview: ReviewDto) {
      try {
        const updated = await this.reviewService.updateReview(id, updatedReview);
        return { message: 'Review updated successfully', review: updated };
      } catch (error) {
        throw new HttpException(
          'Error updating review: ' + error.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Post('remove/:id')
    async removeReview(@Param('id') id: number) {
      try {
        const review = await this.reviewService.removeReview(id);
        return { message: 'Review removed successfully', review };
      } catch (error) {
        // Handle errors
        return { error: 'Failed to remove review' };
      }
    }
  
    @Delete(':id')
    async deleteReview(@Param('id') id: number) {
      try {
        const deleted = await this.reviewService.deleteReview(id);
        return { message: 'Review deleted successfully', review: deleted };
      } catch (error) {
        throw new HttpException(
          'Error deleting review: ' + error.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
  