import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  imports: [JwtModule],
})
export class CategoryModule {}
