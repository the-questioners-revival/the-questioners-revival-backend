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
  Request,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogDto } from 'src/dto/blog.dto'; // Adjust the import based on your actual file structure
import { ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllBlogs(@Request() req) {
    const blogs = await this.blogService.getAllBlogs(req.user.id);
    return blogs;
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getLatestBlog(@Request() req) {
    const blogList = await this.blogService.getLatestBlog(req.user.id);
    return blogList;
  }

  @Get('groupedByDate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getBlogsGroupedByDate(
    @Request() req,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<BlogDto[]> {
    const blogList = await this.blogService.getAllBlogsGroupedByDate(
      req.user.id,
      from,
      to,
    );
    return blogList;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getBlogById(@Request() req, @Param('id') id: number) {
    try {
      const blog = await this.blogService.getBlogById(req.user.id, id);
      return blog;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Error fetching blog: ${error.message}`);
    }
  }

  @Get('getByTodoId/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getBlogByTodoId(@Request() req, @Param('id') id: number) {
    console.log('id: ', id);
    try {
      const blog = await this.blogService.getBlogByTodoId(req.user.id, id);
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
  @ApiBearerAuth()
  async createBlog(@Request() req, @Body() body: BlogDto) {
    const newBlog = await this.blogService.insertBlog(req.user.id, body);

    return { message: 'Blog created successfully', blog: newBlog };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateBlog(
    @Request() req,
    @Param('id') id: number,
    @Body() updatedBlog: BlogDto,
  ) {
    try {
      const updated = await this.blogService.updateBlog(
        req.user.id,
        id,
        updatedBlog,
      );
      return { message: 'Blog updated successfully', blog: updated };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('remove/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeBlog(@Request() req, @Param('id') id: number) {
    try {
      const blog = await this.blogService.removeBlog(req.user.id, id);
      return { message: 'Blog removed successfully', blog };
    } catch (error) {
      // Handle errors
      return { error: error.message };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteBlog(@Request() req, @Param('id') id: number) {
    try {
      const deleted = await this.blogService.deleteBlog(req.user.id, id);
      return { message: 'Blog deleted successfully', blog: deleted };
    } catch (error) {
      return { error: error.message };
    }
  }
}
