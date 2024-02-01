import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MigrationsModule } from './migrations/migrations.module';
import { UsersModule } from './users/users.module';
import { TodoModule } from './todo/todo.module';
import { QaaModule } from './qaa/qaa.module';
import { BlogModule } from './blog/blog.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MigrationsModule,
    UsersModule,
    TodoModule,
    QaaModule,
    BlogModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
