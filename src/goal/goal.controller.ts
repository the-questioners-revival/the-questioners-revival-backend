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
  Req,
  UseGuards,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import { GoalDto } from 'src/dto/goal.dto'; // Assuming you have a GoalDto defined
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Goal')
@Controller('goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllGoals(@Req() req) {
    const goals = await this.goalService.getAllGoals(req.user.id);
    return goals;
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getLatestGoal(@Req() req) {
    const goalList = await this.goalService.getLatestGoal(req.user.id);
    return goalList;
  }

  @Get('fromTo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getGoalsFromTo(
    @Req() req,
    @Query('type') type: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const habitsTrackerList = await this.goalService.getGoalsFromTo(
      req.user.id,
      type,
      from,
      to,
    );
    return habitsTrackerList;
  }

  @Get('groupedByDate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getGoalsGroupedByDate(
    @Req() req,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<GoalDto[]> {
    const goalList = await this.goalService.getAllGoalsGroupedByDate(
      req.user.id,
      from,
      to,
    );
    return goalList;
  }

  @Get('getById/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getGoalById(@Req() req, @Param('id') id: number) {
    try {
      const goal = await this.goalService.getGoalById(req.user.id, id);
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createGoal(@Req() req, @Body() body: GoalDto) {
    const newGoal = await this.goalService.insertGoal(req.user.id, body);

    return { message: 'Goal created successfully', goal: newGoal };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateGoal(
    @Req() req,
    @Param('id') id: number,
    @Body() updatedGoal: GoalDto,
  ) {
    try {
      const updated = await this.goalService.updateGoal(
        req.user.id,
        id,
        updatedGoal,
      );
      return { message: 'Goal updated successfully', goal: updated };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('remove/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeGoal(@Req() req, @Param('id') id: number) {
    try {
      const goal = await this.goalService.removeGoal(req.user.id, id);
      return { message: 'Goal removed successfully', goal };
    } catch (error) {
      // Handle errors
      return { error: error.message };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteGoal(@Req() req, @Param('id') id: number) {
    try {
      const deleted = await this.goalService.deleteGoal(req.user.id, id);
      return { message: 'Goal deleted successfully', goal: deleted };
    } catch (error) {
      return { error: error.message };
    }
  }
}
