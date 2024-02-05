import { ApiProperty } from '@nestjs/swagger';

export class HabitsTrackerDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  habit_id: number;

  @ApiProperty()
  created_at: Date;
}
