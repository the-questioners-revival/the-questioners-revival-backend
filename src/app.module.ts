import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MigrationsModule } from './migrations/migrations.module';
import { UsersModule } from './users/users.module';
import { TodoModule } from './todo/todo.module';
import { QaaModule } from './qaa/qaa.module';
import { BlogModule } from './blog/blog.module';
import { ConfigModule } from '@nestjs/config';
import { HabitModule } from './habit/habit.module';
import { HabitsTrackerModule } from './habits-tracker/habits-tracker.module';
import { GoalModule } from './goal/goal.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CookieUserMiddleware } from './auth/cookie.middleware';
import { CorsMiddleware } from './auth/cors.middleware';
import { DatabaseModule } from './database/database.module';
import { TodoScheduleModule } from './todo-schedules/todo-schedule.module';
import { ActivityCalendarModule } from './activity-calendar/activity-calendar.module';
import { CategoryModule } from './category/category.module';
import { ImagesModule } from './images/images.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Serve files from the 'uploads' directory
      serveRoot: '/uploads', // The URL path where the files will be accessible
    }),
    MigrationsModule,
    UsersModule,
    TodoModule,
    QaaModule,
    BlogModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HabitModule,
    HabitsTrackerModule,
    GoalModule,
    ReviewModule,
    AuthModule,
    JwtModule,
    DatabaseModule,
    TodoScheduleModule,
    ActivityCalendarModule,
    CategoryModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
  exports: [AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the CorsMiddleware to all routes
    consumer.apply(CorsMiddleware).forRoutes('*');

    // Apply the middleware to all routes except those related to authentication
    consumer
      .apply(CookieUserMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.ALL }, // Exclude authentication routes
        { path: 'auth/register', method: RequestMethod.ALL }, // Exclude authentication routes
        { path: '', method: RequestMethod.ALL }, // Exclude authentication routes
        { path: 'uploads/(.*)', method: RequestMethod.ALL }
      )
      .forRoutes('*');
  }
}
