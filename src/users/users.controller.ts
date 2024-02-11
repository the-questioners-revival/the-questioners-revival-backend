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
  UseGuards,
  Request
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from 'src/dto/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Users') 
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/protected')
  @UseGuards(JwtAuthGuard)
  protectedRoute() {
    return 'yes';
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return users;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
