import { Module } from '@nestjs/common';
import { HabitsTrackerController } from './habits-tracker.controller';
import { HabitsTrackerService } from './habits-tracker.service';
import { JwtModule } from '@nestjs/jwt';
import { HabitModule } from 'src/habit/habit.module';

@Module({
  controllers: [HabitsTrackerController],
  providers: [HabitsTrackerService],
  imports: [JwtModule, HabitModule],
})
export class HabitsTrackerModule {}
