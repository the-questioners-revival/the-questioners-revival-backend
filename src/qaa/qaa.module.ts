import { Module } from '@nestjs/common';
import { QaaService } from './qaa.service';
import { QaaController } from './qaa.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [QaaService],
  controllers: [QaaController],
  imports: [JwtModule],
})
export class QaaModule {}
