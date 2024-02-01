import { Module } from '@nestjs/common';
import { QaaService } from './qaa.service';
import { QaaController } from './qaa.controller';

@Module({
  providers: [QaaService],
  controllers: [QaaController]
})
export class QaaModule {}
