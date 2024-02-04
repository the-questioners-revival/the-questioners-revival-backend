import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TODO_STATUS } from 'src/dto/todo-status';
import { TodoDto } from 'src/dto/todo.dto';

@Injectable()
export class TodoService {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getTodoById(id: number): Promise<TodoDto> {
    const result = await this.database.query(
      'SELECT * FROM todos WHERE id = $1',
      [id],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
  }

  async getAllTodos(): Promise<TodoDto[]> {
    const result = await this.database.query('SELECT * FROM todos');
    return result.rows;
  }

  async getLatestTodos(type?: string, status?: string): Promise<TodoDto[]> {
    let whereCount = 1;
    const whereParam = [];
    let where = '';

    if (status) {
      where += `where todos.status = $${whereCount}`;
      whereParam.push(status);

      whereCount++;
    }

    if (type) {
      where += ` and todos.type = $${whereCount}`;
      whereParam.push(type);

      whereCount++;
    }

    const result = await this.database.query(
      `SELECT * FROM todos 
      ${where}
      ORDER by todos.created_at DESC
      `,
      [...whereParam],
    );
    return result.rows;
  }

  async getAllTodosGroupedByDate(): Promise<TodoDto[]> {
    const result = await this.database.query(`
        SELECT DATE(completed_at) AS date,
        JSON_AGG(json_build_object('id', id, 'title', title, 'type', type, 
        'status', status, 'created_at', created_at, 'updated_at', updated_at, 
        'completed_at', completed_at, 'deleted_at', deleted_at) ORDER BY completed_at DESC) AS todos
        FROM todos
        WHERE todos.completed_at IS NOT NULL
        GROUP BY date
        ORDER BY date DESC;
      `);
    return result.rows;
  }

  async insertTodo(todo: TodoDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO todos(title, type, status) VALUES($1, $2, $3) RETURNING *',
        [todo.title, todo.type, TODO_STATUS.IN_PROGRESS],
      );

      console.log('Todo inserted successfully:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting todo:', error);
      throw new HttpException(
        'Error inserting todo: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateTodo(id: number, updatedTodo: TodoDto) {
    try {
      const result = await this.database.query(
        'UPDATE todos SET title = $1, type = $2, status = $3, completed_at = $4, deleted_at = $5, updated_at = $6 WHERE id = $7 RETURNING *',
        [
          updatedTodo.title,
          updatedTodo.type,
          updatedTodo.status,
          updatedTodo.completed_at,
          updatedTodo.deleted_at,
          new Date().toISOString(),
          id,
        ],
      );

      if (result.rows.length > 0) {
        console.log('Todo updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      throw new HttpException(
        'Error updating todo: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateStatusTodo(id: number, status: TODO_STATUS) {
    const now = new Date().toISOString();
    const statusRemoved = status === TODO_STATUS.REMOVED;
    const statusCompleted = status === TODO_STATUS.COMPLETED;
    try {
      const result = await this.database.query(
        'UPDATE todos SET status = $1, updated_at = $2, completed_at = $3, deleted_at = $4 WHERE id = $5 RETURNING *',
        [
          status,
          now,
          statusCompleted ? now : null,
          statusRemoved ? now : null,
          id,
        ],
      );

      if (result.rows.length > 0) {
        console.log('Todo status updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      throw new HttpException(
        'Error updating todo: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async completeTodo(id: number) {
    const now = new Date().toISOString();
    try {
      const result = await this.database.query(
        'UPDATE todos SET status = $1, updated_at = $2, completed_at = $3, deleted_at = $4 WHERE id = $5 RETURNING *',
        [TODO_STATUS.COMPLETED, now, now, null, id],
      );

      if (result.rows.length > 0) {
        console.log('Todo status updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      throw new HttpException(
        'Error updating todo: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async inprogressTodo(id: number) {
    return this.updateStatusTodo(id, TODO_STATUS.IN_PROGRESS);
  }

  async removeTodo(id: number) {
    return this.updateStatusTodo(id, TODO_STATUS.REMOVED);
  }

  async deleteTodo(id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM todos WHERE id = $1 RETURNING *',
        [id],
      );

      if (result.rows.length > 0) {
        console.log('Todo deleted successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw new HttpException(
        'Error deleting todo: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
