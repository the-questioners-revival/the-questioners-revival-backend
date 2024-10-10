import { Module } from '@nestjs/common';
import { TodoScheduleService } from './todo-schedule.service';
import { TodoScheduleController } from './todo-schedule.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [TodoScheduleService],
  controllers: [TodoScheduleController],
  imports: [JwtModule],
})
export class TodoScheduleModule {}
