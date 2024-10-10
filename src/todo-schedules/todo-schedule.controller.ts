import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TodoScheduleService } from './todo-schedule.service';
import { TodoScheduleDto } from 'src/dto/todo-schedule.dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Todo Schedule')
@Controller('todo-schedule')
export class TodoScheduleController {
  constructor(private readonly todoScheduleService: TodoScheduleService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllTodoSchedules(@Req() req) {
    const todoSchedules = await this.todoScheduleService.getAllTodoSchedules(req.user.id);
    return todoSchedules;
  }

  @Get('getById/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTodoScheduleById(@Req() req, @Param('id') id: number) {
    try {
      const todoSchedule = await this.todoScheduleService.getTodoScheduleById(req.user.id, id);
      return todoSchedule;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Error fetching todoSchedule: ${error.message}`);
    }
  }

  @Post()
  @ApiBody({ type: TodoScheduleDto })
  @ApiResponse({ status: 201, description: 'TodoSchedule created', type: TodoScheduleDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createTodoSchedule(@Req() req, @Body() body: TodoScheduleDto) {
    const newTodoSchedule = await this.todoScheduleService.insertTodoSchedule(req.user.id, body);

    return { message: 'TodoSchedule created successfully', todoSchedule: newTodoSchedule };
  }
}
