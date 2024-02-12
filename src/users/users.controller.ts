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
  Request,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from 'src/dto/user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async me(@Request() req) {
    const userWithPerson = await this.usersService.getUserByUsername(
      req.user.username,
    );
    if (!userWithPerson) {
      throw new HttpException('Wrong token', HttpStatus.UNAUTHORIZED);
    }

    return { ...userWithPerson, token: req.cookies.token };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateUser(
    @Request() req,
    @Param('id') id: number,
    @Body() updatedUser: UserDto,
  ) {
    try {
      const updated = await this.usersService.updateUser(
        req.user.id,
        id,
        updatedUser,
      );
      return updated;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteUser(@Request() req, @Param('id') id: number) {
    try {
      const deleted = await this.usersService.deleteUser(req.user.id, id);
      return deleted;
    } catch (error) {
      return { error: error.message };
    }
  }
}
