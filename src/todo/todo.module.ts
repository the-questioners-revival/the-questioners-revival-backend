import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [TodoService],
  controllers: [TodoController],
  imports: [DatabaseModule]
})
export class TodoModule {}
