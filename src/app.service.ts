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

  async search(searchString: string) {
    console.log('searchString: ', searchString);
    const result = await this.database.query(
      `
    SELECT 
      'todos' AS table_name,
      id, 
      title AS text 
    FROM todos 
    WHERE title ILIKE $1
    UNION ALL 
    SELECT 
      'qaas' AS table_name,
      id, 
      question AS text 
    FROM qaas 
    WHERE question ILIKE $1
    UNION ALL 
    SELECT 
      'qaas' AS table_name,
      id, 
      answer AS text 
    FROM qaas 
    WHERE answer ILIKE $1
    UNION ALL 
    SELECT 
      'habits' AS table_name,
      id, 
      title AS text 
    FROM habits 
    WHERE title ILIKE $1
    UNION ALL 
    SELECT 
      'blogs' AS table_name,
      id, 
      text 
    FROM blogs 
    WHERE text ILIKE $1
    UNION ALL 
    SELECT 
      'goals' AS table_name,
      id, 
      title AS text
    FROM goals 
    WHERE title ILIKE $1
    UNION ALL 
    SELECT 
      'reviews' AS table_name,
      id, 
      text
    FROM reviews 
    WHERE text ILIKE $1
  `,
      [`%${searchString}%`],
    );

    return result.rows;
  }
}
