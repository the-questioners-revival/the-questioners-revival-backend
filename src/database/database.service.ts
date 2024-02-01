// database.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Pool } from 'pg';

@Injectable()
export class DatabaseService {
  constructor(
    private readonly configService: ConfigService,
  ) {}
  private database: Pool;

  async getDatabase(): Promise<Client> {
    if (!this.database) {
      this.database = new Pool({
        user: this.configService.get('POSTGRESQL_USER'),
        host: this.configService.get('POSTGRESQL_HOST'),
        database: this.configService.get('POSTGRESQL_DB'),
        password: this.configService.get('POSTGRESQL_PASSWORD'),
        port: this.configService.get('POSTGRESQL_PORT'),
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: this.configService.get('NODE_ENV') ==='prod' ? true: false,
      });

      console.log('Connected to PostgreSQL database');
    }
    return this.database;
  }
}
