import { ApiProperty } from '@nestjs/swagger';

// migration.interface.ts

export class MigrationDto {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  migrationKey: string;

  @ApiProperty()
  appliedAt?: Date;
}
