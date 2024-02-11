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
  UseGuards,
} from '@nestjs/common';
import { HabitsTrackerService } from './habits-tracker.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HabitsTrackerDto } from 'src/dto/habitsTracker.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Habits Tracker')
@Controller('habits-tracker')
export class HabitsTrackerController {
  constructor(private readonly habitsTrackerService: HabitsTrackerService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllHabitsTrackers() {
    const habitsTrackers =
      await this.habitsTrackerService.getAllHabitsTrackers();
    return habitsTrackers;
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  async getLatestHabitsTracker() {
    const habitsTrackerList =
      await this.habitsTrackerService.getLatestHabitsTracker();
    return habitsTrackerList;
  }

  @Get('fromTo')
  @UseGuards(JwtAuthGuard)
  async getHabitsTrackersFromTo(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const habitsTrackerList =
      await this.habitsTrackerService.getHabitsTrackersFromTo(from, to);
    return habitsTrackerList;
  }

  @Get('groupedByDate')
  @UseGuards(JwtAuthGuard)
  async getHabitsTrackersGroupedByDate() {
    const habitsTrackerList =
      await this.habitsTrackerService.getAllHabitsTrackersGroupedByDate();
    return habitsTrackerList;
  }

  @Get('dailyHabitsTrackers')
  @UseGuards(JwtAuthGuard)
  async getDailyHabitsTrackers() {
    const habitsTrackerList =
      await this.habitsTrackerService.getDailyHabitsTrackers();
    return habitsTrackerList;
  }

  @Get('getById/:id')
  @UseGuards(JwtAuthGuard)
  async getHabitsTrackerById(@Param('id') id: number) {
    try {
      const habitsTracker =
        await this.habitsTrackerService.getHabitsTrackerById(id);
      return habitsTracker;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        `Error fetching habitsTracker: ${error.message}`,
      );
    }
  }

  @Post()
  @ApiBody({ type: HabitsTrackerDto })
  @ApiResponse({
    status: 201,
    description: 'HabitsTracker created',
    type: HabitsTrackerDto,
  })
  @UseGuards(JwtAuthGuard)
  async createHabitsTracker(@Body() body: HabitsTrackerDto) {
    const newHabitsTracker =
      await this.habitsTrackerService.insertHabitsTracker(body);

    return {
      message: 'HabitsTracker created successfully',
      habitsTracker: newHabitsTracker,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteHabitsTracker(@Param('id') id: number) {
    try {
      const deleted = await this.habitsTrackerService.deleteHabitsTracker(id);
      return {
        message: 'HabitsTracker deleted successfully',
        habitsTracker: deleted,
      };
    } catch (error) {
      throw new HttpException(
        'Error deleting habitsTracker: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
