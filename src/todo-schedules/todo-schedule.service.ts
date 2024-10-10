import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TodoScheduleDto } from 'src/dto/todo-schedule.dto'; // Assuming you have a TodoScheduleDto defined

@Injectable()
export class TodoScheduleService {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getTodoScheduleById(
    userId: number,
    id: number,
  ): Promise<TodoScheduleDto> {
    const result = await this.database.query(
      `SELECT * FROM todo_schedules WHERE id = $1
        AND user_id = $2`,
      [id, userId],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`TodoSchedule with id ${id} not found`);
    }
  }

  async getAllTodoSchedules(userId: number): Promise<TodoScheduleDto[]> {
    const result = await this.database.query(
      'SELECT * FROM todo_schedules WHERE user_id = $1',
      [userId],
    );
    return result.rows;
  }

  async getAllSchedulesGroupedByDate(
    userId,
    from,
    to,
  ): Promise<TodoScheduleDto[]> {
    const newFrom = new Date(from);
    newFrom.setHours(0, 0, 0, 0);
    const newTo = new Date(to);
    newTo.setHours(23, 59, 59, 999); // Ensure the end time captures the entire last day

    const result = await this.database.query(
      `
        SELECT DATE(todo_schedules.scheduled_date) AS date,
        JSON_AGG(json_build_object(
            'id', todo_schedules.id, 
            'todo_id', todo_schedules.todo_id, 
            'scheduled_date', todo_schedules.scheduled_date, 
            'created_at', todo_schedules.created_at, 
            'updated_at', todo_schedules.updated_at,
            'title', todos.title,
            'type', todos.type
        ) ORDER BY todo_schedules.scheduled_date DESC) AS "todoSchedules"
        FROM todo_schedules
        LEFT JOIN todos ON todos.id = todo_schedules.todo_id
        WHERE todo_schedules.scheduled_date IS NOT NULL
        AND todo_schedules.scheduled_date >= $1 AND todo_schedules.scheduled_date <= $2
        AND todos.user_id = $3
        GROUP BY date
        ORDER BY date DESC;
        `,
      [newFrom, newTo, userId],
    );

    console.log('result: ', result.rows);
    return result.rows;
  }

  async insertTodoSchedule(userId: number, todoSchedule: TodoScheduleDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO todo_schedules(todo_id, scheduled_date) VALUES($1, $2) RETURNING *',
        [todoSchedule.todo_id, todoSchedule.scheduled_date],
      );

      console.log('TodoSchedule inserted successfully:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting todoSchedule:', error);
      throw new HttpException(
        'Error inserting todoSchedule: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
