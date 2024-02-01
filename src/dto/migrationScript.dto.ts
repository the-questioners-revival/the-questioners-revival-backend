import { ApiProperty } from '@nestjs/swagger';

export class MigrationScriptDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  script: string;
}
