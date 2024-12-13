import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ImagesService {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async saveImage(image) {
    try {
      const result = await this.database.query(
        'INSERT INTO images(file_path) VALUES($1) RETURNING *',
        ['uploads/' + image.originalname],
      );

      return result.rows[0];
    } catch (error) {
      throw new HttpException(
        'Error inserting image: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
