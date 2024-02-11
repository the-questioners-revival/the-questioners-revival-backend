import { Module } from '@nestjs/common';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [GoalController],
  providers: [GoalService],
  imports: [JwtModule],
})
export class GoalModule {}
