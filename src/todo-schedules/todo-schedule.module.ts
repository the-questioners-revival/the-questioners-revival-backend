import { Module } from '@nestjs/common';
import { TodoSchedulesService } from './todo-schedules.service';
import { TodoSchedulesController } from './todo-schedules.controller';

@Module({
  providers: [TodoSchedulesService],
  controllers: [TodoSchedulesController]
})
export class TodoSchedulesModule {}
