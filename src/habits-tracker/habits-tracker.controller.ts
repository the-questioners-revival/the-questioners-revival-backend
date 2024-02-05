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
import { HabitsTrackerService } from './habits-tracker.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HabitsTrackerDto } from 'src/dto/habitsTracker.dto';

@ApiTags('Habits Tracker')
@Controller('habits-tracker')
export class HabitsTrackerController {
  constructor(private readonly habitsTrackerService: HabitsTrackerService) {}

  @Get()
  async getAllHabitsTrackers() {
    const habitsTrackers =
      await this.habitsTrackerService.getAllHabitsTrackers();
    return habitsTrackers;
  }

  @Get('latest')
  async getLatestHabitsTracker() {
    const habitsTrackerList =
      await this.habitsTrackerService.getLatestHabitsTracker();
    return habitsTrackerList;
  }

  @Get('groupedByDate')
  async getHabitsTrackersGroupedByDate() {
    const habitsTrackerList =
      await this.habitsTrackerService.getAllHabitsTrackersGroupedByDate();
    return habitsTrackerList;
  }

  @Get('getById/:id')
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
  async createHabitsTracker(@Body() body: HabitsTrackerDto) {
    const newHabitsTracker =
      await this.habitsTrackerService.insertHabitsTracker(body);

    return {
      message: 'HabitsTracker created successfully',
      habitsTracker: newHabitsTracker,
    };
  }

  @Delete(':id')
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
