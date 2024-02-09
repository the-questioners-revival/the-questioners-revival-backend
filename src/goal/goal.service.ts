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

  async getGoalById(id: number): Promise<GoalDto> {
    const result = await this.database.query(
      'SELECT * FROM goals WHERE id = $1',
      [id],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`Goal with id ${id} not found`);
    }
  }

  async getAllGoals(): Promise<GoalDto[]> {
    const result = await this.database.query('SELECT * FROM goals');
    return result.rows;
  }

  async getLatestGoal(): Promise<GoalDto[]> {
    const result = await this.database.query(
      'SELECT * FROM goals ORDER by goals.created_at ASC',
    );
    return result.rows;
  }

  async getGoalsFromTo(type, from, to): Promise<GoalDto[]> {
    console.log('type, from, to: ', type, from, to);
    const result = await this.database.query(
      `SELECT * FROM goals 
          WHERE type = $1
          AND given_at >= $2 AND given_at <= $3
          ORDER by goals.created_at ASC`,
      [type, from, to],
    );
    return result.rows;
  }

  async getAllGoalsGroupedByDate(from, to): Promise<GoalDto[]> {
    const result = await this.database.query(
      `
          SELECT DATE(given_at) AS date,
          JSON_AGG(json_build_object('id', id, 'text', text, 'given_at', given_at, 
          'created_at', created_at, 'updated_at', updated_at, 
          'deleted_at', deleted_at) ORDER BY given_at DESC) AS goals
          FROM goals
          WHERE deleted_at IS NULL
          AND created_at >= $1 AND created_at <= $2
          GROUP BY date
          ORDER BY date DESC;
        `,
      [from, to],
    );
    return result.rows;
  }

  async insertGoal(goal: GoalDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO goals(title, type, given_at) VALUES($1, $2, $3) RETURNING *',
        [goal.title, goal.type, goal.given_at],
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

  async updateGoal(id: number, updatedGoal: GoalDto) {
    try {
      const result = await this.database.query(
        `UPDATE goals SET title = $1, type = $2, given_at = $3, completed_at = $4, deleted_at = $5, updated_at = $6 
          WHERE id = $7 RETURNING *`,
        [
          updatedGoal.title,
          updatedGoal.type,
          updatedGoal.given_at,
          updatedGoal.completed_at,
          updatedGoal.deleted_at,
          new Date().toISOString(),
          id,
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

  async deleteGoal(id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM goals WHERE id = $1 RETURNING *',
        [id],
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

  async removeGoal(id: number) {
    const now = new Date().toISOString();
    try {
      const result = await this.database.query(
        'UPDATE goals SET deleted_at = $1 WHERE id = $2 RETURNING *',
        [now, id],
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
