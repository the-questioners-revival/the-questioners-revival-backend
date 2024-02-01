// user.service.ts

// ... (other imports and class definition)
import {
  HttpException,
  HttpStatus,
  Injectable, NotFoundException, OnModuleInit,
} from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getUserById(id: number): Promise<UserDto> {
    const result = await this.database.query(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async getAllUsers(): Promise<UserDto[]> {
    const result = await this.database.query('SELECT * FROM users');
    return result.rows;
  }
  
  async insertUser(user: UserDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *',
        [user.username, user.email, user.password],
      );

      console.log('User inserted successfully:', result.rows[0]);
    } catch (error) {
      console.error('Error inserting user:', error);
      throw new HttpException(
        'Error inserting user: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUser(id: number, updatedUser: UserDto) {
    console.log('updatedUser: ', updatedUser);
    try {
      const result = await this.database.query(
        'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *',
        [
          updatedUser.username,
          updatedUser.email,
          id,
        ],
      );

      if (result.rows.length > 0) {
        console.log('User updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw new HttpException(
        'Error updating user: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteUser(id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [id],
      );

      if (result.rows.length > 0) {
        console.log('User deleted successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new HttpException(
        'Error deleting user: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
