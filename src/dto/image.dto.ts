import { ApiProperty } from '@nestjs/swagger';

export class ImagesDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  filePath: string;

  @ApiProperty()
  created_at: Date;
}
