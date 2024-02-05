import { Module } from '@nestjs/common';
import { HabitsTrackerController } from './habits-tracker.controller';
import { HabitsTrackerService } from './habits-tracker.service';

@Module({
  controllers: [HabitsTrackerController],
  providers: [HabitsTrackerService]
})
export class HabitsTrackerModule {}
