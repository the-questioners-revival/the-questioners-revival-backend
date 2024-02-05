import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { HabitsTrackerDto } from 'src/dto/habitsTracker.dto'; // Assuming you have a HabitsTrackerDto defined

@Injectable()
export class HabitsTrackerService {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getHabitsTrackerById(id: number): Promise<HabitsTrackerDto> {
    const result = await this.database.query(
      'SELECT * FROM habits_trackers WHERE id = $1',
      [id],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`HabitsTracker with id ${id} not found`);
    }
  }

  async getAllHabitsTrackers(): Promise<HabitsTrackerDto[]> {
    const result = await this.database.query('SELECT * FROM habits_trackers');
    return result.rows;
  }

  async getLatestHabitsTracker(): Promise<HabitsTrackerDto[]> {
    const result = await this.database.query(
      'SELECT * FROM habits_trackers ORDER by habits_trackers.created_at ASC',
    );
    return result.rows;
  }

  async getAllHabitsTrackersGroupedByDate(): Promise<HabitsTrackerDto[]> {
    const result = await this.database.query(`
          SELECT DATE(given_at) AS date,
          JSON_AGG(json_build_object('id', id, 'text', text, 'given_at', given_at, 
          'created_at', created_at, 'updated_at', updated_at, 
          'deleted_at', deleted_at) ORDER BY given_at DESC) AS habits_trackers
          FROM habits_trackers
          WHERE deleted_at IS NULL
          GROUP BY date
          ORDER BY date DESC;
        `);
    return result.rows;
  }

  async insertHabitsTracker(habits_tracker: HabitsTrackerDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO habits_trackers(habit_id, created_at) VALUES($1, $2) RETURNING *',
        [habits_tracker.habit_id, habits_tracker.created_at],
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

  async deleteHabitsTracker(id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM habits_trackers WHERE id = $1 RETURNING *',
        [id],
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
