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
  import { CategoryService } from './category.service';
  import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CategoryDto } from 'src/dto/category.dto';
  
  @ApiTags('Category')
  @Controller('category')
  export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}
  
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getAllCategories(@Req() req) {
      const categorys = await this.categoryService.getAllCategories(req.user.id);
      return categorys;
    }
  
    @Get('latest')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getLatestCategories(@Req() req) {
      const categoryList = await this.categoryService.getLatestCategory(req.user.id);
      return categoryList;
    }

    @Get('tree')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getCategoryTree(@Req() req) {
      const categoryList = await this.categoryService.getCategoryTree(req.user.id);
      return categoryList;
    }
  
    @Get('fromTo')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getCategoriesFromTo(
      @Req() req,
      @Query('type') type: string,
      @Query('from') from: string,
      @Query('to') to: string,
    ) {
      const habitsTrackerList = await this.categoryService.getCategoriesFromTo(
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
    async getCategoriesGroupedByDate(
      @Req() req,
      @Query('from') from: string,
      @Query('to') to: string,
    ): Promise<CategoryDto[]> {
      const categoryList = await this.categoryService.getAllCategoriesGroupedByDate(
        req.user.id,
        from,
        to,
      );
      return categoryList;
    }
  
    @Get('getById/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getCategoryById(@Req() req, @Param('id') id: number) {
      try {
        const category = await this.categoryService.getCategoryById(req.user.id, id);
        return category;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new NotFoundException(`Error fetching category: ${error.message}`);
      }
    }
  
    @Post()
    @ApiBody({ type: CategoryDto })
    @ApiResponse({ status: 201, description: 'Category created', type: CategoryDto })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async createCategory(@Req() req, @Body() body: CategoryDto) {
      const newCategory = await this.categoryService.insertCategory(req.user.id, body);
  
      return { message: 'Category created successfully', category: newCategory };
    }
  
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async updateCategory(
      @Req() req,
      @Param('id') id: number,
      @Body() updatedCategory: CategoryDto,
    ) {
      try {
        const updated = await this.categoryService.updateCategory(
          req.user.id,
          id,
          updatedCategory,
        );
        return { message: 'Category updated successfully', category: updated };
      } catch (error) {
        return { error: error.message };
      }
    }
  
    @Post('remove/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async removeCategory(@Req() req, @Param('id') id: number) {
      try {
        const category = await this.categoryService.removeCategory(req.user.id, id);
        return { message: 'Category removed successfully', category };
      } catch (error) {
        // Handle errors
        return { error: error.message };
      }
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async deleteCategory(@Req() req, @Param('id') id: number) {
      try {
        const deleted = await this.categoryService.deleteCategory(req.user.id, id);
        return { message: 'Category deleted successfully', category: deleted };
      } catch (error) {
        return { error: error.message };
      }
    }
  }
  