import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ActivityCalendarService } from './activity-calendar.service';

@Controller('activity-calendar')
export class ActivityCalendarController {
  constructor(
    private readonly activityCalendarService: ActivityCalendarService,
  ) {}

  @Get('daily')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDailyActivityCounts(@Request() req) {
    const todoList = await this.activityCalendarService.getDailyActivityCounts(
      req.user.id,
    );
    return todoList;
  }
}
