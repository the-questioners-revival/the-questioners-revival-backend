import { ApiProperty } from '@nestjs/swagger';

export class BlogDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;
  
  @ApiProperty()
  category_id: number;

  @ApiProperty()
  given_at: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  deleted_at: Date;

  @ApiProperty()
  todo_id: number;
}
