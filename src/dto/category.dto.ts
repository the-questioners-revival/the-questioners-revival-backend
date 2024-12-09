import { ApiProperty } from '@nestjs/swagger';
import { TodoDto } from './todo.dto';
import { QaaDto } from './qaa.dto';
import { BlogDto } from './blog.dto';

export class CategoryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  category_id: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  deleted_at: Date;
}


export class CategoryDtoResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  category_id: number;

  @ApiProperty()
  children: CategoryDtoResponse | any;

  @ApiProperty()
  todos: TodoDto;

  @ApiProperty()
  qaas: QaaDto;

  @ApiProperty()
  blogs: BlogDto;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  deleted_at: Date;
}