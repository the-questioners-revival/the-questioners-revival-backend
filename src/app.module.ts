import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MigrationsModule } from './migrations/migrations.module';
import { UsersModule } from './users/users.module';
import { TodoModule } from './todo/todo.module';
import { QaaModule } from './qaa/qaa.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [MigrationsModule, UsersModule, TodoModule, QaaModule, BlogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
