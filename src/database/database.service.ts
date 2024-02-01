// database.service.ts

import { Injectable } from '@nestjs/common';
import { Client, Pool } from 'pg';

@Injectable()
export class DatabaseService {
  private database: Pool;

  async getDatabase(): Promise<Client> {
    if (!this.database) {
      this.database = new Pool({
        user: 'user',
        host: 'localhost',
        database: 'the-questioners',
        password: 'g5fD23stTA9otiApg',
        port: 5432,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      console.log('Connected to PostgreSQL database');
    }
    return this.database;
  }
}
