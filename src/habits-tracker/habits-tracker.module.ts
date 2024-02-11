import { Module } from '@nestjs/common';
import { HabitsTrackerController } from './habits-tracker.controller';
import { HabitsTrackerService } from './habits-tracker.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [HabitsTrackerController],
  providers: [HabitsTrackerService],
  imports: [JwtModule],
})
export class HabitsTrackerModule {}
