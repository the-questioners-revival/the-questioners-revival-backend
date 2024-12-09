import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { BlogDto } from 'src/dto/blog.dto'; // Assuming you have a BlogDto defined

@Injectable()
export class BlogService {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getBlogById(userId: number, id: number): Promise<BlogDto> {
    const result = await this.database.query(
      'SELECT * FROM blogs WHERE id = $1 AND user_id = $2',
      [id, userId],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }

  async getBlogByTodoId(userId: number, id: number): Promise<BlogDto> {
    const result = await this.database.query(
      'SELECT * FROM blogs WHERE todo_id = $1 AND user_id = $2',
      [id, userId],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`Blog with todo id ${id} not found`);
    }
  }

  async getAllBlogs(userId: number): Promise<BlogDto[]> {
    const result = await this.database.query(
      'SELECT * FROM blogs WHERE user_id = $1',
      [userId],
    );
    return result.rows;
  }

  async getLatestBlog(userId: number): Promise<BlogDto[]> {
    const result = await this.database.query(
      'SELECT * FROM blogs WHERE user_id = $1 ORDER by blogs.created_at ASC',
      [userId],
    );
    return result.rows;
  }

  async getAllBlogsGroupedByDate(userId: number, from, to): Promise<BlogDto[]> {
    const newFrom = new Date(from);
    newFrom.setHours(0, 0, 0, 0);
    const newTo = new Date(to);
    newTo.setHours(23, 59, 59, 0);
    const result = await this.database.query(
      `
        SELECT DATE(given_at) AS date,
        JSON_AGG(json_build_object('id', id, 'text', text, 'category_id', category_id, 'given_at', given_at, 
        'created_at', created_at, 'updated_at', updated_at, 
        'deleted_at', deleted_at, 'todo_id', todo_id) ORDER BY given_at DESC) AS blogs
        FROM blogs
        WHERE user_id = $1 AND deleted_at IS NULL
        AND given_at >= $2 AND given_at <= $3
        GROUP BY date
        ORDER BY date DESC;
      `,
      [userId, newFrom, newTo],
    );
    return result.rows;
  }

  async insertBlog(userId: number, blog: BlogDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO blogs(text, category_id, given_at, user_id, todo_id) VALUES($1, $2, $3, $4, $5) RETURNING *',
        [blog.text, blog.category_id, blog.given_at, userId, blog.todo_id],
      );

      console.log('Blog inserted successfully:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting blog:', error);
      throw new HttpException(
        'Error inserting blog: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateBlog(userId: number, id: number, updatedBlog: BlogDto) {
    try {
      const foundBlog = await this.getBlogById(userId, id);
      if (!foundBlog) {
        throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
      }

      const result = await this.database.query(
        'UPDATE blogs SET text = $1, category_id = $2, given_at = $3, deleted_at = $4, updated_at = $5, todo_id = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
        [
          updatedBlog.text ? updatedBlog.text : foundBlog.text,
          updatedBlog.category_id
            ? updatedBlog.category_id
            : foundBlog.category_id,
          updatedBlog.given_at ? updatedBlog.given_at : foundBlog.given_at,
          updatedBlog.deleted_at
            ? updatedBlog.deleted_at
            : foundBlog.deleted_at,
          new Date().toISOString(),
          updatedBlog.todo_id,
          id,
          userId,
        ],
      );

      if (result.rows.length > 0) {
        console.log('Blog updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      throw new HttpException(
        'Error updating blog: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteBlog(userId: number, id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM blogs WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId],
      );

      if (result.rows.length > 0) {
        console.log('Blog deleted successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw new HttpException(
        'Error deleting blog: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeBlog(userId: number, id: number) {
    const now = new Date().toISOString();
    try {
      const result = await this.database.query(
        'UPDATE blogs SET deleted_at = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [now, id, userId],
      );

      if (result.rows.length > 0) {
        console.log('Blog status updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      throw new HttpException(
        'Error updating blog: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
