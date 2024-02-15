import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { HabitDto } from 'src/dto/habit.dto'; // Assuming you have a HabitDto defined

@Injectable()
export class HabitService {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getHabitById(userId: number, id: number): Promise<HabitDto> {
    const result = await this.database.query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [id, userId],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`Habit with id ${id} not found`);
    }
  }

  async getAllHabits(userId: number): Promise<HabitDto[]> {
    const result = await this.database.query(
      'SELECT * FROM habits WHERE user_id = $1',
      [userId],
    );
    return result.rows;
  }

  async getLatestHabit(userId: number): Promise<HabitDto[]> {
    const result = await this.database.query(
      'SELECT * FROM habits WHERE user_id = $1 AND habits.deleted_at IS NULL ORDER by habits.created_at ASC',
      [userId],
    );
    return result.rows;
  }

  async getAllHabitsGroupedByDate(userId: number): Promise<HabitDto[]> {
    const result = await this.database.query(
      `
          SELECT DATE(created_at) AS date,
          JSON_AGG(json_build_object('id', id, 'title', title, 'type', type, 'repeat', repeat,
          'created_at', created_at, 'updated_at', updated_at, 
          'deleted_at', deleted_at) ORDER BY created_at DESC) AS habits
          FROM habits
          WHERE user_id = $1 AND deleted_at IS NULL
          GROUP BY date
          ORDER BY date DESC;
        `,
      [userId],
    );
    return result.rows;
  }

  async getDailyHabits(userId: number): Promise<HabitDto[]> {
    const result = await this.database.query(
      `SELECT * FROM habits WHERE user_id = $1 AND habits.repeat = 'daily'`,
      [userId],
    );
    return result.rows;
  }

  async insertHabit(userId: number, habit: HabitDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO habits(title, type, repeat, user_id) VALUES($1, $2, $3, $4) RETURNING *',
        [habit.title, habit.type, habit.repeat, userId],
      );

      console.log('Habit inserted successfully:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting habit:', error);
      throw new HttpException(
        'Error inserting habit: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateHabit(userId: number, id: number, updatedHabit: HabitDto) {
    try {
      const result = await this.database.query(
        'UPDATE habits SET title = $1, type = $2, repeat = $3, deleted_at = $4, updated_at = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
        [
          updatedHabit.title,
          updatedHabit.type,
          updatedHabit.repeat,
          updatedHabit.deleted_at,
          new Date().toISOString(),
          id,
          userId,
        ],
      );

      if (result.rows.length > 0) {
        console.log('Habit updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Habit not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating habit:', error);
      throw new HttpException(
        'Error updating habit: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteHabit(userId: number, id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId],
      );

      if (result.rows.length > 0) {
        console.log('Habit deleted successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Habit not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw new HttpException(
        'Error deleting habit: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeHabit(userId: number, id: number) {
    const now = new Date().toISOString();
    try {
      const result = await this.database.query(
        'UPDATE habits SET deleted_at = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [now, id, userId],
      );

      if (result.rows.length > 0) {
        console.log('Habit status updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Habit not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating habit:', error);
      throw new HttpException(
        'Error updating habit: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
