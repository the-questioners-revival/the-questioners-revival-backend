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
  
    async getTodoScheduleById(userId: number, id: number): Promise<TodoScheduleDto> {
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
  