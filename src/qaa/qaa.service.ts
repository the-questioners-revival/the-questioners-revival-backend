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

  async getQaaById(userId: number, id: number): Promise<QaaDto> {
    const result = await this.database.query(
      `SELECT * FROM qaas 
        WHERE id = $1
        AND user_id = $2`,
      [id, userId],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new NotFoundException(`Qaa with id ${id} not found`);
    }
  }

  async getAllQaa(userId: number): Promise<QaaDto[]> {
    const result = await this.database.query(
      `SELECT * FROM qaas
        WHERE user_id = $1`,
      [userId],
    );
    return result.rows;
  }

  async getLatestQaas(
    userId: number,
    type?: string,
    showRemoved?: string,
  ): Promise<QaaDto[]> {
    let whereCount = 1;
    const whereParam = [];
    let where = '';

    if (showRemoved && showRemoved.toLowerCase() === 'true') {
      where += `WHERE qaas.deleted_at IS NOT NULL`;
    } else if (showRemoved && showRemoved.toLowerCase() === 'false') {
      where += `WHERE qaas.deleted_at IS NULL`;
    }

    if (type) {
      where +=
        where.length > 0
          ? ` and qaas.type = $${whereCount}`
          : `WHERE qaas.type = $${whereCount}`;
      whereParam.push(type);

      whereCount++;
    }

    if (userId) {
      where += `${
        where.length > 0 ? ' AND' : 'WHERE'
      } qaas.user_id = $${whereCount}`;
      whereParam.push(userId);

      whereCount++;
    }

    const result = await this.database.query(
      `SELECT * FROM qaas 
        ${where}
        ORDER by qaas.created_at DESC
      `,
      [...whereParam],
    );

    return result.rows;
  }

  async getAllQaasGroupedByDate(userId: number, from, to): Promise<QaaDto[]> {
    const newFrom = new Date(from);
    newFrom.setHours(0, 0, 0, 0);
    const newTo = new Date(to);
    newTo.setHours(23, 59, 59, 0);
    const result = await this.database.query(
      `
    SELECT DATE(created_at) AS date,
    JSON_AGG(json_build_object('id', id, 'question', question, 'answer', answer, 
    'type', type, 'link', link, 'created_at', created_at, 'updated_at', updated_at, 
    'deleted_at', deleted_at) ORDER BY created_at DESC) AS qaas
    FROM qaas
    WHERE created_at >= $1 AND created_at <= $2
    AND user_id = $3
    GROUP BY date
    ORDER BY date DESC;
    `,
      [newFrom, newTo, userId],
    );
    return result.rows;
  }

  async insertQaa(userId: number, qaa: QaaDto) {
    try {
      const result = await this.database.query(
        'INSERT INTO qaas(question, answer, type, link, user_id) VALUES($1, $2, $3, $4, $5) RETURNING *',
        [qaa.question, qaa.answer, qaa.type, qaa.link, userId],
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

  async updateQaa(userId: number, id: number, updatedQaa: QaaDto) {
    try {
      const foundQaa = await this.getQaaById(userId, id);
      if (!foundQaa) {
        throw new HttpException('Qaa not found', HttpStatus.NOT_FOUND);
      }
      const result = await this.database.query(
        'UPDATE qaas SET question = $1, answer = $2, type = $3, link = $4, deleted_at = $5, updated_at = $6  WHERE id = $7 RETURNING *',
        [
          updatedQaa.question ? updatedQaa.question : foundQaa.question,
          updatedQaa.answer ? updatedQaa.answer : foundQaa.answer,
          updatedQaa.type ? updatedQaa.type : foundQaa.type,
          updatedQaa.link ? updatedQaa.link : foundQaa.link,
          updatedQaa.deleted_at,
          new Date().toISOString(),
          id,
        ],
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

  async removeQaa(userId: number, id: number) {
    const now = new Date().toISOString();
    try {
      const foundQaa = await this.getQaaById(userId, id);
      if (!foundQaa) {
        throw new HttpException('Qaa not found', HttpStatus.NOT_FOUND);
      }
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

  async deleteQaa(userId: number, id: number) {
    try {
      const foundQaa = await this.getQaaById(userId, id);
      if (!foundQaa) {
        throw new HttpException('Qaa not found', HttpStatus.NOT_FOUND);
      }
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
