// user.service.ts

// ... (other imports and class definition)
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from 'src/dto/register.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getUserById(id: number): Promise<UserDto> {
    const result = await this.database.query(
      'SELECT u.username, u.email FROM users u WHERE u.id = $1',
      [id],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async getUserByUsername(username: string): Promise<UserDto> {
    const result = await this.database.query(
      'SELECT u.username, u.email FROM users u WHERE u.username = $1',
      [username],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`User with username ${username} not found`);
    }
  }

  async getAllUsers(): Promise<UserDto[]> {
    const result = await this.database.query('SELECT * FROM users');
    return result.rows;
  }

  async insertUser(registerData: RegisterDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *',
        [registerData.username, registerData.email, registerData.password],
      );

      console.log('User inserted successfully:', result.rows[0]);
      return result[0];
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
        [updatedUser.username, updatedUser.email, id],
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

  async createUser(registerData: RegisterDto): Promise<UserDto> {
    const hashedPassword = await bcrypt.hash(registerData.password, 10);
    const newUser = this.insertUser({
      ...registerData,
      password: hashedPassword,
    });
    return newUser;
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserDto | null> {
    const user = await this.getUserByUsername(username);
    if (user && bcrypt.compareSync(password, user.password)) {
      return user;
    }
    return null;
  }
}
