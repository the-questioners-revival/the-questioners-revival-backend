import { Injectable } from '@nestjs/common';
import * as data from './utils/quotes.json';
import * as stoicData from './utils/stoic.quotes.json';
import * as motivationalData from './utils/motivational.quotes.json';
import * as entrepreneurData from './utils/entrepreneur.quotes.json';
import * as codingData from './utils/coding.quotes.json';
import * as affirmationsData from './utils/affirmations.quotes.json';
import * as affirmationsData2 from './utils/affirmations2.quotes.json';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();
  }

  getHello(): string {
    return 'Hello World!';
  }

  getRandomQuote(type: string): any {
    let res;
    if (type === 'stoic') {
      res = stoicData;
    } else if (type === 'motivational') {
      res = motivationalData;
    } else if (type === 'entrepreneur') {
      res = entrepreneurData;
    } else if (type === 'coding') {
      res = codingData;
    } else if (type === 'affirmations') {
      res = affirmationsData;
    } else if (type === 'affirmations2') {
      res = affirmationsData2;
    } else {
      res = data;
    }
    const randomNumber = Math.floor(Math.random() * res.quotes.length);
    return res.quotes[randomNumber];
  }

  async search(searchString: string, userId: number) {
    console.log('searchString: ', searchString);
    const result = await this.database.query(
      `
      SELECT 
      'todos' AS table_name,
      id,
      title AS text,
      NULL AS answer,
      NULL AS link,
      created_at,
      'title' AS column_name
      FROM todos 
      WHERE title ILIKE $1
      AND todos.user_id = $2
      UNION ALL 
      SELECT 
          'qaas' AS table_name,
          id, 
          question AS text,
          answer,
          link,
          created_at,
          'question' AS column_name
      FROM qaas 
      WHERE (question ILIKE $1 OR answer ILIKE $1 OR link ILIKE $1)
      AND qaas.user_id = $2
      UNION ALL 
      SELECT 
          'blogs' AS table_name,
          id, 
          text,
          NULL AS answer,
          NULL AS link,
          given_at as created_at,
          'text' AS column_name
      FROM blogs 
      WHERE text ILIKE $1
      AND blogs.user_id = $2
      UNION ALL 
      SELECT 
          'goals' AS table_name,
          id, 
          title AS text,
          NULL AS answer,
          NULL AS link,
          given_at as created_at,
          'title' AS column_name
      FROM goals 
      WHERE title ILIKE $1
      AND goals.user_id = $2
      UNION ALL 
      SELECT 
          'reviews' AS table_name,
          id, 
          text,
          NULL AS answer,
          NULL AS link,
          given_at as created_at,
          'text' AS column_name
      FROM reviews 
      WHERE text ILIKE $1
      AND reviews.user_id = $2
      ORDER by created_at DESC
  `,
      [`%${searchString}%`, userId],
    );

    return result.rows;
  }
}
