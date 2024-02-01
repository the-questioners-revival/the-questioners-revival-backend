import { Module } from '@nestjs/common';
import { MigrationsService } from './migrations.service';
import { MigrationsController } from './migrations.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [MigrationsService],
  controllers: [MigrationsController],
  imports: [DatabaseModule],
})
export class MigrationsModule {}
