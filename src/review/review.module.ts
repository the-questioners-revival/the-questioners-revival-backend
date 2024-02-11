import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
  imports: [JwtModule],
})
export class ReviewModule {}
