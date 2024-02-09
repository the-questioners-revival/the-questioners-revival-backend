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

  async getReviewById(id: number): Promise<ReviewDto> {
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

  async getAllReviews(): Promise<ReviewDto[]> {
    const result = await this.database.query('SELECT * FROM reviews');
    return result.rows;
  }

  async getLatestReview(): Promise<ReviewDto[]> {
    const result = await this.database.query(
      'SELECT * FROM reviews ORDER by reviews.created_at ASC',
    );
    return result.rows;
  }

  async getReviewsFromTo(type, from, to): Promise<ReviewDto[]> {
    const result = await this.database.query(
      `SELECT * FROM reviews 
            WHERE type = $1
            AND given_at >= $2 AND given_at <= $3
            AND deleted_at IS NULL
            ORDER by reviews.created_at ASC`,
      [type, from, to],
    );
    return result.rows;
  }

  async getAllReviewsGroupedByDate(from, to): Promise<ReviewDto[]> {
    const result = await this.database.query(
      `
            SELECT DATE(given_at) AS date,
            JSON_AGG(json_build_object('id', id, 'text', text, 'given_at', given_at, 
            'created_at', created_at, 'updated_at', updated_at, 
            'deleted_at', deleted_at) ORDER BY given_at DESC) AS reviews
            FROM reviews
            WHERE deleted_at IS NULL
            AND created_at >= $1 AND created_at <= $2
            GROUP BY date
            ORDER BY date DESC;
          `,
      [from, to],
    );
    return result.rows;
  }

  async insertReview(review: ReviewDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO reviews(text, type, given_at) VALUES($1, $2, $3) RETURNING *',
        [review.text, review.type, review.given_at],
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

  async updateReview(id: number, updatedReview: ReviewDto) {
    try {
      const result = await this.database.query(
        `UPDATE reviews SET text = $1, type = $2, given_at = $3, deleted_at = $4, updated_at = $5
            WHERE id = $6 RETURNING *`,
        [
          updatedReview.text,
          updatedReview.type,
          updatedReview.given_at,
          updatedReview.deleted_at,
          new Date().toISOString(),
          id,
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

  async deleteReview(id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM reviews WHERE id = $1 RETURNING *',
        [id],
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

  async removeReview(id: number) {
    const now = new Date().toISOString();
    try {
      const result = await this.database.query(
        'UPDATE reviews SET deleted_at = $1 WHERE id = $2 RETURNING *',
        [now, id],
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
