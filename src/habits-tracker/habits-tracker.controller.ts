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
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HabitsTrackerService } from './habits-tracker.service';
import { ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { HabitsTrackerDto } from 'src/dto/habitsTracker.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Habits Tracker')
@Controller('habits-tracker')
export class HabitsTrackerController {
  constructor(private readonly habitsTrackerService: HabitsTrackerService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAllHabitsTrackers(@Request() req) {
    const habitsTrackers = await this.habitsTrackerService.getAllHabitsTrackers(
      req.user.id,
    );
    return habitsTrackers;
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getLatestHabitsTracker(@Request() req) {
    const habitsTrackerList =
      await this.habitsTrackerService.getLatestHabitsTracker(req.user.id);
    return habitsTrackerList;
  }

  @Get('fromTo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getHabitsTrackersFromTo(
    @Request() req,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const habitsTrackerList =
      await this.habitsTrackerService.getHabitsTrackersFromTo(
        req.user.id,
        from,
        to,
      );
    return habitsTrackerList;
  }

  @Get('groupedByDate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getHabitsTrackersGroupedByDate(@Request() req) {
    const habitsTrackerList =
      await this.habitsTrackerService.getAllHabitsTrackersGroupedByDate(
        req.user.id,
      );
    return habitsTrackerList;
  }

  @Get('dailyHabitsTrackers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDailyHabitsTrackers(@Request() req) {
    const habitsTrackerList =
      await this.habitsTrackerService.getDailyHabitsTrackers(req.user.id);
    return habitsTrackerList;
  }

  @Get('getById/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getHabitsTrackerById(@Request() req, @Param('id') id: number) {
    try {
      const habitsTracker =
        await this.habitsTrackerService.getHabitsTrackerById(req.user.id, id);
      return habitsTracker;
    } catch (error) {
      return { error: error.message };
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
  @ApiBearerAuth()
  async createHabitsTracker(@Request() req, @Body() body: HabitsTrackerDto) {
    const newHabitsTracker =
      await this.habitsTrackerService.insertHabitsTracker(req.user.id, body);
    return {
      message: 'HabitsTracker created successfully',
      habitsTracker: newHabitsTracker,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteHabitsTracker(@Request() req, @Param('id') id: number) {
    try {
      const deleted = await this.habitsTrackerService.deleteHabitsTracker(
        req.user.id,
        id,
      );
      return {
        message: 'HabitsTracker deleted successfully',
        habitsTracker: deleted,
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}
