import { ApiProperty } from '@nestjs/swagger';

export class TodoScheduleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  todo_id: number;

  @ApiProperty()
  scheduled_date: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  deleted_at: Date;
}
