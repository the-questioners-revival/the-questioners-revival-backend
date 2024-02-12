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
  Req,
  UseGuards,
} from '@nestjs/common';
import { HabitService } from './habit.service';
import { HabitDto } from 'src/dto/habit.dto'; // Assuming you have a HabitDto defined
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Habit')
@Controller('habit')
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllHabits(@Req() req) {
    const habits = await this.habitService.getAllHabits(req.user.id);
    return habits;
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getLatestHabit(@Req() req) {
    const habitList = await this.habitService.getLatestHabit(req.user.id);
    return habitList;
  }

  @Get('groupedByDate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getHabitsGroupedByDate(@Req() req) {
    const habitList = await this.habitService.getAllHabitsGroupedByDate(
      req.user.id,
    );
    return habitList;
  }

  @Get('daily')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDailyHabits(@Req() req) {
    const habitList = await this.habitService.getDailyHabits(req.user.id);
    return habitList;
  }

  @Get('getById/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getHabitById(@Req() req, @Param('id') id: number) {
    try {
      const habit = await this.habitService.getHabitById(req.user.id, id);
      return habit;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Error fetching habit: ${error.message}`);
    }
  }

  @Post()
  @ApiBody({ type: HabitDto })
  @ApiResponse({ status: 201, description: 'Habit created', type: HabitDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createHabit(@Req() req, @Body() body: HabitDto) {
    const newHabit = await this.habitService.insertHabit(req.user.id, body);

    return { message: 'Habit created successfully', habit: newHabit };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateHabit(
    @Req() req,
    @Param('id') id: number,
    @Body() updatedHabit: HabitDto,
  ) {
    try {
      const updated = await this.habitService.updateHabit(
        req.user.id,
        id,
        updatedHabit,
      );
      return { message: 'Habit updated successfully', habit: updated };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('remove/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeHabit(@Req() req, @Param('id') id: number) {
    try {
      const habit = await this.habitService.removeHabit(req.user.id, id);
      return { message: 'Habit removed successfully', habit };
    } catch (error) {
      // Handle errors
      return { error: error.message };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteHabit(@Req() req, @Param('id') id: number) {
    try {
      const deleted = await this.habitService.deleteHabit(req.user.id, id);
      return { message: 'Habit deleted successfully', habit: deleted };
    } catch (error) {
      return { error: error.message };
    }
  }
}
