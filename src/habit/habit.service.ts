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
  
    async getHabitById(id: number): Promise<HabitDto> {
      const result = await this.database.query(
        'SELECT * FROM habits WHERE id = $1',
        [id],
      );
  
      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        throw new NotFoundException(`Habit with id ${id} not found`);
      }
    }
  
    async getAllHabits(): Promise<HabitDto[]> {
      const result = await this.database.query('SELECT * FROM habits');
      return result.rows;
    }
  
    async getLatestHabit(): Promise<HabitDto[]> {
      const result = await this.database.query(
        'SELECT * FROM habits WHERE habits.deleted_at IS NULL ORDER by habits.created_at ASC',
      );
      return result.rows;
    }
  
    async getAllHabitsGroupedByDate(): Promise<HabitDto[]> {
      const result = await this.database.query(`
          SELECT DATE(given_at) AS date,
          JSON_AGG(json_build_object('id', id, 'text', text, 'given_at', given_at, 
          'created_at', created_at, 'updated_at', updated_at, 
          'deleted_at', deleted_at) ORDER BY given_at DESC) AS habits
          FROM habits
          WHERE deleted_at IS NULL
          GROUP BY date
          ORDER BY date DESC;
        `);
      return result.rows;
    }
  
    async insertHabit(habit: HabitDto) {
      try {
        const result = await this.database.query(
          'INSERT INTO habits(title, type) VALUES($1, $2) RETURNING *',
          [habit.title, habit.type],
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
  
    async updateHabit(id: number, updatedHabit: HabitDto) {
      try {
        const result = await this.database.query(
          'UPDATE habits SET title = $1, type = $2, deleted_at = $3, updated_at = $4 WHERE id = $5 RETURNING *',
          [
            updatedHabit.title,
            updatedHabit.type,
            updatedHabit.deleted_at,
            new Date().toISOString(),
            id,
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
  
    async deleteHabit(id: number) {
      try {
        const result = await this.database.query(
          'DELETE FROM habits WHERE id = $1 RETURNING *',
          [id],
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
  
    async removeHabit(id: number) {
      const now = new Date().toISOString();
      try {
        const result = await this.database.query(
          'UPDATE habits SET deleted_at = $1 WHERE id = $2 RETURNING *',
          [now, id],
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
  