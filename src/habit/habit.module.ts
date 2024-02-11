import { Module } from '@nestjs/common';
import { HabitController } from './habit.controller';
import { HabitService } from './habit.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [HabitController],
  providers: [HabitService],
  imports: [JwtModule],
})
export class HabitModule {}
