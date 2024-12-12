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
    const searchTerm = `%${searchString}%`;
  
    const todosQuery = this.database.query(
      `SELECT 'todos' AS table_name, * FROM todos WHERE user_id = $1 AND (title ILIKE $2) AND deleted_at IS NULL`, 
      [userId, searchTerm]
    );
  
    const qaasQuery = this.database.query(
      `SELECT 'qaas' AS table_name, * FROM qaas WHERE user_id = $1 AND (question ILIKE $2 OR answer ILIKE $2 OR link ILIKE $2) AND deleted_at IS NULL`, 
      [userId, searchTerm]
    );
  
    const blogsQuery = this.database.query(
      `SELECT 'blogs' AS table_name, * FROM blogs WHERE user_id = $1 AND (text ILIKE $2) AND deleted_at IS NULL`, 
      [userId, searchTerm]
    );
  
    const goalsQuery = this.database.query(
      `SELECT 'goals' AS table_name, * FROM goals WHERE user_id = $1 AND (title ILIKE $2) AND deleted_at IS NULL`, 
      [userId, searchTerm]
    );
  
    const reviewsQuery = this.database.query(
      `SELECT 'reviews' AS table_name, * FROM reviews WHERE user_id = $1 AND (text ILIKE $2) AND deleted_at IS NULL`, 
      [userId, searchTerm]
    );
  
    // Run all queries in parallel
    const results = await Promise.all([todosQuery, qaasQuery, blogsQuery, goalsQuery, reviewsQuery]);
  
    // Combine results into one array
    const combinedResults = [
      ...results[0].rows, 
      ...results[1].rows, 
      ...results[2].rows, 
      ...results[3].rows, 
      ...results[4].rows
    ];
  
    // Optional: sort results by created_at if present
    combinedResults.sort((a, b) => 
      new Date(b.created_at || b.given_at).getTime() - new Date(a.created_at || a.given_at).getTime()
    );
    return combinedResults;
  }
  
}
