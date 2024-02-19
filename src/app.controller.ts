import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('quote/:type?')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getRandomQuote(@Param('type') type?: string): string {
    return this.appService.getRandomQuote(type);
  }

  @Get('search/:searchString')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  search(@Param('searchString') searchString?: string) {
    return this.appService.search(searchString);
  }
}
