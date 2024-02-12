import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { GoalDto } from 'src/dto/goal.dto'; // Assuming you have a GoalDto defined

@Injectable()
export class GoalService {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getGoalById(userId: number, id: number): Promise<GoalDto> {
    const result = await this.database.query(
      `SELECT * FROM goals WHERE id = $1
      AND user_id = $2`,
      [id, userId],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`Goal with id ${id} not found`);
    }
  }

  async getAllGoals(userId: number): Promise<GoalDto[]> {
    const result = await this.database.query(
      'SELECT * FROM goals WHERE user_id = $1',
      [userId],
    );
    return result.rows;
  }

  async getLatestGoal(userId: number): Promise<GoalDto[]> {
    const result = await this.database.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER by goals.created_at ASC',
      [userId],
    );
    return result.rows;
  }

  async getGoalsFromTo(
    userId: number,
    type: string,
    from: string,
    to: string,
  ): Promise<GoalDto[]> {
    console.log('type, from, to: ', type, from, to);
    const result = await this.database.query(
      `SELECT * FROM goals 
          WHERE user_id = $1
          AND type = $2
          AND given_at >= $3 AND given_at <= $4
          AND deleted_at IS NULL
          ORDER by goals.created_at ASC`,
      [userId, type, from, to],
    );
    return result.rows;
  }

  async getAllGoalsGroupedByDate(
    userId: number,
    from: string,
    to: string,
  ): Promise<GoalDto[]> {
    const result = await this.database.query(
      `
          SELECT DATE(given_at) AS date,
          JSON_AGG(json_build_object('id', id, 'text', text, 'given_at', given_at, 
          'created_at', created_at, 'updated_at', updated_at, 
          'deleted_at', deleted_at) ORDER BY given_at DESC) AS goals
          FROM goals
          WHERE user_id = $1
          AND deleted_at IS NULL
          AND created_at >= $2 AND created_at <= $3
          GROUP BY date
          ORDER BY date DESC;
        `,
      [userId, from, to],
    );
    return result.rows;
  }

  async insertGoal(userId: number, goal: GoalDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO goals(title, type, given_at, user_id) VALUES($1, $2, $3, $4) RETURNING *',
        [goal.title, goal.type, goal.given_at, userId],
      );

      console.log('Goal inserted successfully:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting goal:', error);
      throw new HttpException(
        'Error inserting goal: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateGoal(userId: number, id: number, updatedGoal: GoalDto) {
    try {
      const result = await this.database.query(
        `UPDATE goals SET title = $1, type = $2, given_at = $3, completed_at = $4, deleted_at = $5, updated_at = $6 
          WHERE id = $7 AND user_id = $8 RETURNING *`,
        [
          updatedGoal.title,
          updatedGoal.type,
          updatedGoal.given_at,
          updatedGoal.completed_at,
          updatedGoal.deleted_at,
          new Date().toISOString(),
          id,
          userId,
        ],
      );

      if (result.rows.length > 0) {
        console.log('Goal updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Goal not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new HttpException(
        'Error updating goal: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteGoal(userId: number, id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId],
      );

      if (result.rows.length > 0) {
        console.log('Goal deleted successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Goal not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw new HttpException(
        'Error deleting goal: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeGoal(userId: number, id: number) {
    const now = new Date().toISOString();
    try {
      const result = await this.database.query(
        'UPDATE goals SET deleted_at = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [now, id, userId],
      );

      if (result.rows.length > 0) {
        console.log('Goal status updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Goal not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new HttpException(
        'Error updating goal: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
