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
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogDto } from 'src/dto/blog.dto'; // Assuming you have a BlogDto defined
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllBlogs() {
    const blogs = await this.blogService.getAllBlogs();
    return blogs;
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  async getLatestBlog() {
    const blogList = await this.blogService.getLatestBlog();
    return blogList;
  }

  @Get('groupedByDate')
  @UseGuards(JwtAuthGuard)
  async getBlogsGroupedByDate(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<BlogDto[]> {
    const blogList = await this.blogService.getAllBlogsGroupedByDate(from, to);
    return blogList;
  }

  @Get('getById/:id')
  @UseGuards(JwtAuthGuard)
  async getBlogById(@Param('id') id: number) {
    try {
      const blog = await this.blogService.getBlogById(id);
      return blog;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Error fetching blog: ${error.message}`);
    }
  }

  @Post()
  @ApiBody({ type: BlogDto })
  @ApiResponse({ status: 201, description: 'Blog created', type: BlogDto })
  @UseGuards(JwtAuthGuard)
  async createBlog(@Body() body: BlogDto) {
    const newBlog = await this.blogService.insertBlog(body);

    return { message: 'Blog created successfully', blog: newBlog };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateBlog(@Param('id') id: number, @Body() updatedBlog: BlogDto) {
    try {
      const updated = await this.blogService.updateBlog(id, updatedBlog);
      return { message: 'Blog updated successfully', blog: updated };
    } catch (error) {
      throw new HttpException(
        'Error updating blog: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('remove/:id')
  @UseGuards(JwtAuthGuard)
  async removeBlog(@Param('id') id: number) {
    try {
      const blog = await this.blogService.removeBlog(id);
      return { message: 'Blog removed successfully', blog };
    } catch (error) {
      // Handle errors
      return { error: 'Failed to remove blog' };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBlog(@Param('id') id: number) {
    try {
      const deleted = await this.blogService.deleteBlog(id);
      return { message: 'Blog deleted successfully', blog: deleted };
    } catch (error) {
      throw new HttpException(
        'Error deleting blog: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
