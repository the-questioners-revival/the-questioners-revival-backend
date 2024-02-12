import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { HabitsTrackerDto } from 'src/dto/habitsTracker.dto'; // Assuming you have a HabitsTrackerDto defined
import { HabitService } from 'src/habit/habit.service';

@Injectable()
export class HabitsTrackerService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly habitService: HabitService,
  ) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getHabitsTrackerById(
    userId: number,
    id: number,
  ): Promise<HabitsTrackerDto> {
    const result = await this.database.query(
      'SELECT * FROM habits_trackers WHERE id = $1 AND user_id = $2',
      [id, userId],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`HabitsTracker with id ${id} not found`);
    }
  }

  async getAllHabitsTrackers(userId: number): Promise<HabitsTrackerDto[]> {
    const result = await this.database.query(
      'SELECT * FROM habits_trackers WHERE user_id = $1',
      [userId],
    );
    return result.rows;
  }

  async getLatestHabitsTracker(userId: number): Promise<HabitsTrackerDto[]> {
    const result = await this.database.query(
      'SELECT * FROM habits_trackers WHERE user_id = $1 ORDER by habits_trackers.created_at ASC',
      [userId],
    );
    return result.rows;
  }

  async getHabitsTrackersFromTo(
    userId: number,
    from,
    to,
  ): Promise<HabitsTrackerDto[]> {
    const result = await this.database.query(
      `SELECT * FROM habits_trackers 
      WHERE created_at >= $1 AND created_at <= $2 AND user_id = $3
      ORDER by habits_trackers.created_at ASC`,
      [from, to, userId],
    );
    return result.rows;
  }

  async getAllHabitsTrackersGroupedByDate(
    userId: number,
  ): Promise<HabitsTrackerDto[]> {
    const result = await this.database.query(
      `
          SELECT DATE(given_at) AS date,
          JSON_AGG(json_build_object('id', id, 'text', text, 'given_at', given_at, 
          'created_at', created_at, 'updated_at', updated_at, 
          'deleted_at', deleted_at) ORDER BY given_at DESC) AS habits_trackers
          FROM habits_trackers
          WHERE deleted_at IS NULL AND user_id = $1
          GROUP BY date
          ORDER BY date DESC;
        `,
      [userId],
    );
    return result.rows;
  }

  async getDailyHabitsTrackers(userId: number): Promise<HabitsTrackerDto[]> {
    const result = await this.database.query(
      `SELECT habits_trackers.id, habits.title, habits.type, habits_trackers.habit_id, habits_trackers.created_at FROM habits 
      LEFT JOIN habits_trackers ON habits.id = habits_trackers.habit_id
      WHERE habits.repeat = 'daily' AND habits_trackers.user_id = $1`,
      [userId],
    );
    return result.rows;
  }

  async insertHabitsTracker(userId: number, habits_tracker: HabitsTrackerDto) {
    try {
      const foundHabit = await this.habitService.getHabitById(
        userId,
        habits_tracker.habit_id,
      );
      if (!foundHabit) {
        throw new HttpException('Habit not found', HttpStatus.NOT_FOUND);
      }

      const result = await this.database.query(
        'INSERT INTO habits_trackers(habit_id, created_at, user_id) VALUES($1, $2, $3) RETURNING *',
        [habits_tracker.habit_id, habits_tracker.created_at, userId],
      );

      console.log('HabitsTracker inserted successfully:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting habits_tracker:', error);
      throw new HttpException(
        'Error inserting habits_tracker: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteHabitsTracker(userId: number, id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM habits_trackers WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId],
      );

      if (result.rows.length > 0) {
        console.log('HabitsTracker deleted successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException(
          'HabitsTracker not found',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      console.error('Error deleting habits_tracker:', error);
      throw new HttpException(
        'Error deleting habits_tracker: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
