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
  import { HabitService } from './habit.service';
  import { HabitDto } from 'src/dto/habit.dto'; // Assuming you have a HabitDto defined
  import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
  
  @ApiTags('Habit')
  @Controller('habit')
  export class HabitController {
    constructor(private readonly habitService: HabitService) {}
  
    @Get()
    async getAllHabits() {
      const habits = await this.habitService.getAllHabits();
      return habits;
    }
  
    @Get('latest')
    async getLatestHabit() {
      const habitList = await this.habitService.getLatestHabit();
      return habitList;
    }
  
    @Get('groupedByDate')
    async getHabitsGroupedByDate() {
      const habitList = await this.habitService.getAllHabitsGroupedByDate();
      return habitList;
    }
  
    @Get('getById/:id')
    async getHabitById(@Param('id') id: number) {
      try {
        const habit = await this.habitService.getHabitById(id);
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
    async createHabit(@Body() body: HabitDto) {
      const newHabit = await this.habitService.insertHabit(body);
  
      return { message: 'Habit created successfully', habit: newHabit };
    }
  
    @Put(':id')
    async updateHabit(@Param('id') id: number, @Body() updatedHabit: HabitDto) {
      try {
        const updated = await this.habitService.updateHabit(id, updatedHabit);
        return { message: 'Habit updated successfully', habit: updated };
      } catch (error) {
        throw new HttpException(
          'Error updating habit: ' + error.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Post('remove/:id')
    async removeHabit(@Param('id') id: number) {
      try {
        const habit = await this.habitService.removeHabit(id);
        return { message: 'Habit removed successfully', habit };
      } catch (error) {
        // Handle errors
        return { error: 'Failed to remove habit' };
      }
    }
  
    @Delete(':id')
    async deleteHabit(@Param('id') id: number) {
      try {
        const deleted = await this.habitService.deleteHabit(id);
        return { message: 'Habit deleted successfully', habit: deleted };
      } catch (error) {
        throw new HttpException(
          'Error deleting habit: ' + error.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
  