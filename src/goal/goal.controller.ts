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
  Query,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import { GoalDto } from 'src/dto/goal.dto'; // Assuming you have a GoalDto defined
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Goal')
@Controller('goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Get()
  async getAllGoals() {
    const goals = await this.goalService.getAllGoals();
    return goals;
  }

  @Get('latest')
  async getLatestGoal() {
    const goalList = await this.goalService.getLatestGoal();
    return goalList;
  }

  @Get('fromTo')
  async getGoalsFromTo(@Query('type') type: string, @Query('from') from: string, @Query('to') to: string) {
    const habitsTrackerList = await this.goalService.getGoalsFromTo(type, from, to);
    return habitsTrackerList;
  }

  @Get('groupedByDate')
  async getGoalsGroupedByDate(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<GoalDto[]> {
    const goalList = await this.goalService.getAllGoalsGroupedByDate(from, to);
    return goalList;
  }

  @Get('getById/:id')
  async getGoalById(@Param('id') id: number) {
    try {
      const goal = await this.goalService.getGoalById(id);
      return goal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Error fetching goal: ${error.message}`);
    }
  }

  @Post()
  @ApiBody({ type: GoalDto })
  @ApiResponse({ status: 201, description: 'Goal created', type: GoalDto })
  async createGoal(@Body() body: GoalDto) {
    const newGoal = await this.goalService.insertGoal(body);

    return { message: 'Goal created successfully', goal: newGoal };
  }

  @Put(':id')
  async updateGoal(@Param('id') id: number, @Body() updatedGoal: GoalDto) {
    try {
      const updated = await this.goalService.updateGoal(id, updatedGoal);
      return { message: 'Goal updated successfully', goal: updated };
    } catch (error) {
      throw new HttpException(
        'Error updating goal: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('remove/:id')
  async removeGoal(@Param('id') id: number) {
    try {
      const goal = await this.goalService.removeGoal(id);
      return { message: 'Goal removed successfully', goal };
    } catch (error) {
      // Handle errors
      return { error: 'Failed to remove goal' };
    }
  }

  @Delete(':id')
  async deleteGoal(@Param('id') id: number) {
    try {
      const deleted = await this.goalService.deleteGoal(id);
      return { message: 'Goal deleted successfully', goal: deleted };
    } catch (error) {
      throw new HttpException(
        'Error deleting goal: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
