// migrations.service.ts

import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from 'pg';
import { migrations } from './migrations';
import { DatabaseService } from 'src/database/database.service';
import { MigrationScriptDto } from 'src/dto/migrationScript.dto';

@Injectable()
export class MigrationsService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}
  private database;

  async onModuleInit() {
    this.database = await this.databaseService.getDatabase();

    await this.createMigrationsTable();
    await this.applyMigrations();
  }

  async createMigrationsTable() {
    // Check if the migrations table exists before applying
    const result = await this.database.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'migrations')`,
    );

    if (result.rows[0].exists) {
      console.log('Table migrations already exists.');
      return;
    }

    console.log('Creating migrations table...');
    try {
      const result = await this.database.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          migration_key VARCHAR(255) UNIQUE NOT NULL,
          applied_at TIMESTAMPTZ DEFAULT current_timestamp
        )
      `);

      console.log('Migrations table created successfully');
    } catch (error) {
      console.error('Error creating migrations table:', error);
    }
  }

  async migrationExists(migrationKey: string): Promise<boolean> {
    try {
      const result = await this.database.query(
        'SELECT EXISTS (SELECT 1 FROM migrations WHERE migration_key = $1)',
        [migrationKey],
      );

      return result.rows[0].exists;
    } catch (error) {
      console.error('Error checking migration existence:', error);
      return false;
    }
  }

  async markMigrationAsApplied(migrationKey: string) {
    try {
      await this.database.query(
        'INSERT INTO migrations (migration_key) VALUES ($1)',
        [migrationKey],
      );

      console.log(`Migration '${migrationKey}' applied successfully`);
    } catch (error) {
      console.error('Error marking migration as applied:', error);
    }
  }

  async applyMigration(migration: MigrationScriptDto) {
    try {
      const migrationExists = await this.migrationExists(migration.key);

      if (migrationExists) {
        console.log(`Migration ${migration.key} already exists.`);
      } else {
        // Execute user migration logic here
        console.log(`Applying ${migration.key} migration...`);

        await this.database.query(`
            ${migration.script}
          `);
        await this.markMigrationAsApplied(migration.key);
      }
    } catch (error) {
      console.error(`Error applying migration '${migration.key}':`, error);
    }
  }

  async applyMigrations() {
    console.log('Applying all migrations now');
    try {
      for (const migration of migrations) {
        await this.applyMigration(migration);
      }
    } catch (error) {
      console.error('Error applying migrations:', error);
    }
  }
}
