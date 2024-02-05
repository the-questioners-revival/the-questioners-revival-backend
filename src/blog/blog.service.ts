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

  async getBlogById(id: number): Promise<BlogDto> {
    const result = await this.database.query(
      'SELECT * FROM blogs WHERE id = $1',
      [id],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }

  async getAllBlogs(): Promise<BlogDto[]> {
    const result = await this.database.query('SELECT * FROM blogs');
    return result.rows;
  }

  async getLatestBlog(): Promise<BlogDto[]> {
    const result = await this.database.query(
      'SELECT * FROM blogs ORDER by blogs.created_at ASC',
    );
    return result.rows;
  }

  async getAllBlogsGroupedByDate(): Promise<BlogDto[]> {
    const result = await this.database.query(`
        SELECT DATE(given_at) AS date,
        JSON_AGG(json_build_object('id', id, 'text', text, 'given_at', given_at, 
        'created_at', created_at, 'updated_at', updated_at, 
        'deleted_at', deleted_at) ORDER BY given_at DESC) AS blogs
        FROM blogs
        WHERE deleted_at IS NULL
        GROUP BY date
        ORDER BY date DESC;
      `);
    return result.rows;
  }

  async insertBlog(blog: BlogDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO blogs(text, given_at) VALUES($1, $2) RETURNING *',
        [blog.text, blog.given_at],
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

  async updateBlog(id: number, updatedBlog: BlogDto) {
    try {
      const result = await this.database.query(
        'UPDATE blogs SET text = $1, given_at = $2, deleted_at = $3, updated_at = $4 WHERE id = $5 RETURNING *',
        [
          updatedBlog.text,
          updatedBlog.given_at,
          updatedBlog.deleted_at,
          new Date().toISOString(),
          id,
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

  async deleteBlog(id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM blogs WHERE id = $1 RETURNING *',
        [id],
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

  async removeBlog(id: number) {
    const now = new Date().toISOString();
    try {
      const result = await this.database.query(
        'UPDATE blogs SET deleted_at = $1 WHERE id = $2 RETURNING *',
        [now, id],
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
