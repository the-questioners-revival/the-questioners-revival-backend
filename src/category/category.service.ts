import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CategoryDto, CategoryDtoResponse } from 'src/dto/category.dto'; // Assuming you have a CategoryDto defined

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

  async getCategoriesFromTo(
    userId: number,
    type,
    from,
    to,
  ): Promise<CategoryDto[]> {
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
        [category.name, category.category_id, userId],
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

  async updateCategory(
    userId: number,
    id: number,
    updatedCategory: CategoryDto,
  ) {
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
          updatedCategory.category_id
            ? updatedCategory.category_id
            : foundCategory.category_id,
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

  // Function to get all related todos, qaas, and blogs for a category
  private async getCategoryContent(category_id: number) {
    const todos = await this.database.query(
      `SELECT *, 
        'todos' AS table_name
       FROM todos WHERE category_id = $1`,
      [category_id],
    );
    const qaas = await this.database.query(
      `SELECT *, 
        'qaas' AS table_name
       FROM qaas WHERE category_id = $1`,
      [category_id],
    );
    const blogs = await this.database.query(
      `SELECT * ,
        'blogs' AS table_name
        FROM blogs WHERE category_id = $1`,
      [category_id],
    );

    return {
      todos: todos.rows,
      qaas: qaas.rows,
      blogs: blogs.rows,
    };
  }

  // Function to build the category tree recursively
  private async buildCategoryTree(
    categories: CategoryDtoResponse[],
  ): Promise<CategoryDtoResponse[]> {
    const categoryMap: { [key: number]: CategoryDtoResponse } = {};
    const categoryTree: CategoryDtoResponse[] = [];

    // Step 1: Map categories by their ID
    categories.forEach((category) => {
      categoryMap[category.id] = category;
      category.children = [];
    });

    // Step 2: Build the category tree
    categories.forEach((category) => {
      if (category.category_id === null) {
        // Root category
        categoryTree.push(category);
      } else {
        // Child category, add to its parent's children array
        const parentCategory = categoryMap[category.category_id];
        if (parentCategory) {
          parentCategory.children.push(category);
        }
      }
    });

    // Step 3: Recursively fetch content for all categories
    const fetchContentRecursively = async (category: CategoryDtoResponse) => {
      // Fetch and assign content for the current category
      const content = await this.getCategoryContent(category.id);
      category.todos = content.todos;
      category.qaas = content.qaas;
      category.blogs = content.blogs;

      // Recursively fetch content for all children
      for (const child of category.children) {
        await fetchContentRecursively(child);
      }
    };

    // Step 4: Fetch content for all root categories and their descendants
    for (const category of categoryTree) {
      await fetchContentRecursively(category);
    }

    return categoryTree;
  }

  // Main function to get category tree
  public async getCategoryTree(userId: number): Promise<CategoryDtoResponse[]> {
    // Fetch all categories for the user
    const result = await this.database.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY categories.created_at ASC',
      [userId],
    );

    const categories: CategoryDtoResponse[] = result.rows;
    console.log('categories: ', categories);

    // Build the category tree with related content
    const res = await this.buildCategoryTree(categories);
    console.log('res: ', JSON.stringify(res));
    return res;
  }
}
