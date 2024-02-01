import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { QAA_STATUS } from 'src/dto/qaa-status';
import { QaaDto } from 'src/dto/qaa.dto'; // Adjust the import based on your actual file structure

@Injectable()
export class QaaService {
  private database;

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  async getQaaById(id: number): Promise<QaaDto> {
    const result = await this.database.query(
      'SELECT * FROM qaas WHERE id = $1',
      [id],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`Qaa with id ${id} not found`);
    }
  }

  async getAllQaa(): Promise<QaaDto[]> {
    const result = await this.database.query('SELECT * FROM qaas');
    return result.rows;
  }

  async getLatestQaas(): Promise<QaaDto[]> {
    const result = await this.database.query(
      `SELECT * FROM qaas 
        WHERE qaas.deleted_at IS NULL
        ORDER by qaas.created_at ASC
      `,
    );
    return result.rows;
  }

  async getAllQaasGroupedByDate(): Promise<QaaDto[]> {
    const result = await this.database.query(`
        SELECT DATE(created_at) AS date,
        JSON_AGG(json_build_object('id', id, 'question', question, 'answer', answer, 
        'type', type, 'created_at', created_at, 'updated_at', updated_at, 
        'deleted_at', deleted_at)) AS qaas
        FROM qaas
        GROUP BY date
        ORDER BY date DESC;
      `);
    return result.rows;
  }

  async insertQaa(qaa: QaaDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO qaas(question, answer, type) VALUES($1, $2, $3) RETURNING *',
        [qaa.question, qaa.answer, qaa.type],
      );

      console.log('Qaa inserted successfully:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error inserting Qaa:', error);
      throw new HttpException(
        'Error inserting Qaa: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateQaa(id: number, updatedQaa: QaaDto) {
    console.log('updatedQaa: ', updatedQaa);
    try {
      const result = await this.database.query(
        'UPDATE qaas SET question = $1, answer = $2, type = $3 WHERE id = $4 RETURNING *',
        [updatedQaa.question, updatedQaa.answer, updatedQaa.type, id],
      );

      if (result.rows.length > 0) {
        console.log('Qaa updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Qaa not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating Qaa:', error);
      throw new HttpException(
        'Error updating Qaa: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeQaa(id: number) {
    const now = new Date().toISOString();
    try {
      const result = await this.database.query(
        'UPDATE qaas SET deleted_at = $1 WHERE id = $2 RETURNING *',
        [now, id],
      );

      if (result.rows.length > 0) {
        console.log('Qaa status updated successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Qaa not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error updating qaa:', error);
      throw new HttpException(
        'Error updating qaa: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteQaa(id: number) {
    try {
      const result = await this.database.query(
        'DELETE FROM qaas WHERE id = $1 RETURNING *',
        [id],
      );

      if (result.rows.length > 0) {
        console.log('Qaa deleted successfully:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new HttpException('Qaa not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error('Error deleting Qaa:', error);
      throw new HttpException(
        'Error deleting Qaa: ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
