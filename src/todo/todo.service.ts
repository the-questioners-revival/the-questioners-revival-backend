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

  async getTodoById(userId: number, id: number): Promise<TodoDto> {
    const result = await this.database.query(
      `SELECT * FROM todos 
        WHERE id = $1
        AND user_id = $2`,
      [id, userId],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
  }

  async getAllTodos(userId: number): Promise<TodoDto[]> {
    const result = await this.database.query(
      `SELECT * FROM todos
        WHERE user_id = $1`,
      [userId],
    );
    return result.rows;
  }

  async getLatestTodos(
    userId: number,
    type?: string,
    status?: string,
    priority?: string,
  ): Promise<TodoDto[]> {
    let whereCount = 1;
    const whereParam = [];
    let where = '';

    if (status) {
      where += `where todos.status = $${whereCount}`;
      whereParam.push(status);

      whereCount++;
    }

    if (type) {
      where += `${
        where.length > 0 ? ' AND' : 'WHERE'
      } todos.type = $${whereCount}`;
      whereParam.push(type);

      whereCount++;
    }

    if (priority) {
      where += `${
        where.length > 0 ? ' AND' : 'WHERE'
      } todos.priority = $${whereCount}`;
      whereParam.push(priority);

      whereCount++;
    }

    if (userId) {
      where += `${
        where.length > 0 ? ' AND' : 'WHERE'
      } todos.user_id = $${whereCount}`;
      whereParam.push(userId);

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

  async getAllTodosGroupedByDate(userId, from, to): Promise<TodoDto[]> {
    const newFrom = new Date(from);
    newFrom.setHours(0, 0, 0, 0);
    const newTo = new Date(to);
    newTo.setHours(23, 59, 59, 0);

    const result = await this.database.query(
      `
        SELECT DATE(completed_at) AS date,
        JSON_AGG(json_build_object('id', id, 'title', title, 'type', type, 
        'status', status, 'created_at', created_at, 'updated_at', updated_at, 
        'completed_at', completed_at, 'deleted_at', deleted_at) ORDER BY completed_at DESC) AS todos
        FROM todos
        WHERE todos.completed_at IS NOT NULL
        AND completed_at >= $1 AND completed_at <= $2
        AND user_id =$3
        GROUP BY date
        ORDER BY date DESC;
      `,
      [newFrom, newTo, userId],
    );
    return result.rows;
  }

  async insertTodo(userId: number, todo: TodoDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO todos(title, type, priority, status, user_id) VALUES($1, $2, $3, $4, $5) RETURNING *',
        [todo.title, todo.type, todo.priority, TODO_STATUS.IN_PROGRESS, userId],
      );

      return result.rows[0];
    } catch (error) {
      throw new HttpException(
        'Error inserting todo: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateTodo(userId: number, id: number, updatedTodo: TodoDto) {
    try {
      const foundTodo = await this.getTodoById(userId, id);
      if (!foundTodo) {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }

      const result = await this.database.query(
        'UPDATE todos SET title = $1, type = $2, priority = $3, status = $4, completed_at = $5, deleted_at = $6, updated_at = $7 WHERE id = $8 RETURNING *',
        [
          updatedTodo.title ? updatedTodo.title : foundTodo.title,
          updatedTodo.type ? updatedTodo.type : foundTodo.type,
          updatedTodo.priority ? updatedTodo.priority : foundTodo.priority,
          updatedTodo.status ? updatedTodo.status : foundTodo.status,
          updatedTodo.completed_at
            ? updatedTodo.completed_at
            : foundTodo.completed_at,
          updatedTodo.deleted_at
            ? updatedTodo.deleted_at
            : foundTodo.deleted_at,
          new Date().toISOString(),
          id,
        ],
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        'Error updating todo: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateStatusTodo(userId: number, id: number, status: TODO_STATUS) {
    const now = new Date().toISOString();
    const statusRemoved = status === TODO_STATUS.REMOVED;
    const statusCompleted = status === TODO_STATUS.COMPLETED;
    try {
      const foundTodo = await this.getTodoById(userId, id);
      if (!foundTodo) {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
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
        return result.rows[0];
      } else {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        'Error updating todo: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async completeTodo(userId: number, id: number) {
    const now = new Date().toISOString();
    try {
      const foundTodo = await this.getTodoById(userId, id);
      if (!foundTodo) {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
      const result = await this.database.query(
        'UPDATE todos SET status = $1, updated_at = $2, completed_at = $3, deleted_at = $4 WHERE id = $5 RETURNING *',
        [TODO_STATUS.COMPLETED, now, now, null, id],
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        'Error updating todo: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async inprogressTodo(userId: number, id: number) {
    return this.updateStatusTodo(userId, id, TODO_STATUS.IN_PROGRESS);
  }

  async removeTodo(userId: number, id: number) {
    return this.updateStatusTodo(userId, id, TODO_STATUS.REMOVED);
  }

  async deleteTodo(userId, id: number) {
    try {
      const foundTodo = await this.getTodoById(userId, id);
      if (!foundTodo) {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
      const result = await this.database.query(
        'DELETE FROM todos WHERE id = $1 RETURNING *',
        [id],
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        'Error deleting todo: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
