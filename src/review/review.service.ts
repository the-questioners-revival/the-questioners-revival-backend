import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ReviewDto } from 'src/dto/review.dto'; // Assuming you have a ReviewDto defined

@Injectable()
export class ReviewService {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getReviewById(userId: number, id: number): Promise<ReviewDto> {
    const result = await this.database.query(
      'SELECT * FROM reviews WHERE id = $1',
      [id],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
  }

  async getAllReviews(userId: number): Promise<ReviewDto[]> {
    const result = await this.database.query('SELECT * FROM reviews WHERE user_id = $1', [userId]);
    return result.rows;
  }

  async getLatestReview(userId: number): Promise<ReviewDto[]> {
    const result = await this.database.query(
      'SELECT * FROM reviews WHERE user_id = $1 ORDER by reviews.created_at ASC',
      [userId],
    );
    return result.rows;
  }

  async getReviewsFromTo(userId: number, type, from, to): Promise<ReviewDto[]> {
    const result = await this.database.query(
      `SELECT * FROM reviews 
            WHERE user_id = $1
            AND type = $2
            AND given_at >= $3 AND given_at <= $4
            AND deleted_at IS NULL
            ORDER by reviews.created_at ASC`,
      [userId, type, from, to],
    );
    return result.rows;
  }

  async getAllReviewsGroupedByDate(userId: number, from, to): Promise<ReviewDto[]> {
    const newFrom = new Date(from)
    newFrom.setHours(0, 0, 0, 0);
    const newTo = new Date(from)
    newTo.setHours(23, 59, 59, 0);
    const result = await this.database.query(
      `
            SELECT DATE(given_at) AS date,
            JSON_AGG(json_build_object('id', id, 'text', text, 'given_at', given_at, 
            'created_at', created_at, 'updated_at', updated_at, 
            'deleted_at', deleted_at) ORDER BY given_at DESC) AS reviews
            FROM reviews
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

  async insertReview(userId: number, review: ReviewDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO reviews(text, type, given_at, user_id) VALUES($1, $2, $3, $4) RETURNING *',
        [review.text, review.type, review.given_at, userId],
      );

      console.log('Review inserted successfully:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting review:', error);
      throw new HttpException(
        'Error inserting review: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateReview(userId: number, id: number, updatedReview: ReviewDto) {
    try {
      const result = await this.database.query(
        `UPDATE reviews SET text = $1, type = $2, given_at = $3, deleted_at = $4, updated_at = $5
            WHERE id = $6 AND user_id = $7 RETURNING *`,
        [
          updatedReview.text,
          updatedReview.type,
          updatedReview.given_at,
          updatedReview.deleted_at,
          new Date().toISOString(),
          id,
          userId,
        ],
      );

      if (result.rows.length > 0) {
        console.log('Review updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      throw new HttpException(
        'Error updating review: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteReview(userId: number, id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId],
      );

      if (result.rows.length > 0) {
        console.log('Review deleted successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new HttpException(
        'Error deleting review: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeReview(userId: number, id: number) {
    const now = new Date().toISOString();
    try {
      const result = await this.database.query(
        'UPDATE reviews SET deleted_at = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [now, id, userId],
      );

      if (result.rows.length > 0) {
        console.log('Review status updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      throw new HttpException(
        'Error updating review: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
