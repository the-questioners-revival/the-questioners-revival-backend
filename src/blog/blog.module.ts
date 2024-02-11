import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [BlogService],
  controllers: [BlogController],
  imports: [JwtModule],
})
export class BlogModule {}
