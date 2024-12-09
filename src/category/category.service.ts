import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { DatabaseService } from 'src/database/database.service';
  import { CategoryDto } from 'src/dto/category.dto'; // Assuming you have a CategoryDto defined
  
  @Injectable()
  export class CategoryService {
    constructor(private readonly databaseService: DatabaseService) {}
    private database;
  
    async onModuleInit() {
      this.database = await this.databaseService.getDatabase();
    }
  
    async getCategoryById(userId: number, id: number): Promise<CategoryDto> {
      const result = await this.database.query(
        'SELECT * FROM categories WHERE id = $1',
        [id],
      );
  
      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        throw new NotFoundException(`Category with id ${id} not found`);
      }
    }
  
    async getAllCategories(userId: number): Promise<CategoryDto[]> {
      const result = await this.database.query(
        'SELECT * FROM categories WHERE user_id = $1',
        [userId],
      );
      return result.rows;
    }
  
    async getLatestCategory(userId: number): Promise<CategoryDto[]> {
      const result = await this.database.query(
        'SELECT * FROM categories WHERE user_id = $1 ORDER by categories.created_at ASC',
        [userId],
      );
      return result.rows;
    }
  
    async getCategoriesFromTo(userId: number, type, from, to): Promise<CategoryDto[]> {
      const result = await this.database.query(
        `SELECT * FROM categories 
              WHERE user_id = $1
              AND type = $2
              AND given_at >= $3 AND given_at <= $4
              AND deleted_at IS NULL
              ORDER by categories.created_at ASC`,
        [userId, type, from, to],
      );
      return result.rows;
    }
  
    async getAllCategoriesGroupedByDate(
      userId: number,
      from,
      to,
    ): Promise<CategoryDto[]> {
      const newFrom = new Date(from);
      newFrom.setHours(0, 0, 0, 0);
      const newTo = new Date(to);
      newTo.setHours(23, 59, 59, 0);
      const result = await this.database.query(
        `
              SELECT DATE(given_at) AS date,
              JSON_AGG(json_build_object('id', id, 'text', text, 'given_at', given_at, 
              'created_at', created_at, 'updated_at', updated_at, 
              'deleted_at', deleted_at) ORDER BY given_at DESC) AS categories
              FROM categories
              WHERE user_id = $1
              AND deleted_at IS NULL
              AND created_at >= $2 AND created_at <= $3
              GROUP BY date
              ORDER BY date DESC;
            `,
        [userId, newFrom, newTo],
      );
      return result.rows;
    }
  
    async insertCategory(userId: number, category: CategoryDto) {
      try {
        const result = await this.database.query(
          'INSERT INTO categories(name, category_id, user_id) VALUES($1, $2, $3) RETURNING *',
          [category.name, category.categoryId, userId],
        );
  
        console.log('Category inserted successfully:', result.rows[0]);
        return result.rows[0];
      } catch (error) {
        console.error('Error inserting category:', error);
        throw new HttpException(
          'Error inserting category: ' + error,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    async updateCategory(userId: number, id: number, updatedCategory: CategoryDto) {
      try {
        const foundCategory = await this.getCategoryById(userId, id);
        if (!foundCategory) {
          throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
  
        const result = await this.database.query(
          `UPDATE categories SET name = $1, category_id = $2, deleted_at = $3, updated_at = $4
              WHERE id = $5 AND user_id = $7 RETURNING *`,
          [
            updatedCategory.name ? updatedCategory.name : foundCategory.name,
            updatedCategory.categoryId ? updatedCategory.categoryId : foundCategory.categoryId,
            updatedCategory.deleted_at,
            new Date().toISOString(),
            id,
            userId,
          ],
        );
  
        if (result.rows.length > 0) {
          console.log('Category updated successfully:', result.rows[0]);
          return result.rows[0];
        } else {
          throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
      } catch (error) {
        console.error('Error updating category:', error);
        throw new HttpException(
          'Error updating category: ' + error,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    async deleteCategory(userId: number, id: number) {
      try {
        const result = await this.database.query(
          'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
          [id, userId],
        );
  
        if (result.rows.length > 0) {
          console.log('Category deleted successfully:', result.rows[0]);
          return result.rows[0];
        } else {
          throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        throw new HttpException(
          'Error deleting category: ' + error,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    async removeCategory(userId: number, id: number) {
      const now = new Date().toISOString();
      try {
        const result = await this.database.query(
          'UPDATE categories SET deleted_at = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
          [now, id, userId],
        );
  
        if (result.rows.length > 0) {
          console.log('Category status updated successfully:', result.rows[0]);
          return result.rows[0];
        } else {
          throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
      } catch (error) {
        console.error('Error updating category:', error);
        throw new HttpException(
          'Error updating category: ' + error,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
  