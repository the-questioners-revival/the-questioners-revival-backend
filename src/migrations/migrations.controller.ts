import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MigrationsService } from './migrations.service';

@ApiTags('Migrations')
@Controller('migrations')
export class MigrationsController {
  constructor(private readonly migrationsService: MigrationsService) {}

  @Get('migration/todos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async migrateTodos(@Request() req) {
    const todos = await this.migrationsService.migrateTodoData();
    return todos;
  }

  @Get('migration/qaas')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async migrateQaas(@Request() req) {
    const todos = await this.migrationsService.migrateQaasData();
    return todos;
  }
}
