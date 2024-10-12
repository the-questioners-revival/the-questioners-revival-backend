import { Module } from '@nestjs/common';
import { ActivityCalendarService } from './activity-calendar.service';
import { ActivityCalendarController } from './activity-calendar.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [ActivityCalendarService],
  controllers: [ActivityCalendarController],
  imports: [DatabaseModule, JwtModule],
})
export class ActivityCalendarModule {}
