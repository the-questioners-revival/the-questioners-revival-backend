import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from 'src/dto/user.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users') 
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    try {
      const user = await this.usersService.getUserById(id);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Error fetching user: ${error.message}`);
    }
  }

  @Get()
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return users;
  }

  @Post()
  @ApiBody({ type: UserDto })
  @ApiResponse({ status: 201, description: 'User created', type: UserDto })
  async createUser(@Body() body: UserDto) {
    const newUser = await this.usersService.insertUser(body);

    return { message: 'User created successfully', user: newUser };
  }

  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() updatedUser: UserDto) {
    try {
      const updated = await this.usersService.updateUser(id, updatedUser);
      return updated;
    } catch (error) {
      throw new HttpException(
        'Error updating user: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    try {
      const deleted = await this.usersService.deleteUser(id);
      return deleted;
    } catch (error) {
      throw new HttpException(
        'Error deleting user: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
