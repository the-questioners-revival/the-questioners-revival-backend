// migrations.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { migrations } from './migrations';
import { DatabaseService } from 'src/database/database.service';
import { MigrationScriptDto } from 'src/dto/migrationScript.dto';
import { MongoClient } from 'mongodb';

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

  async migrateTodoData() {
    const mongoClient = new MongoClient(process.env.MONGO_URL);
    await mongoClient.connect();
    const mongoDb = mongoClient.db('joestodo');
    const mongoCollection = mongoDb.collection('tasks');

    try {
      // Step 1: Fetch data from MongoDB
      const todos = await mongoCollection
        .find()
        .sort({ create_date: 1 })
        .toArray();
      console.log('todos: ', todos);

      // Step 2: Transform data (if needed)
      const transformedTodos = todos.map((todo) => [
        todo.title + ' ' + todo.description,
        todo.type,
        todo.state,
        todo.create_date,
        todo.state === 'completed' ? todo.create_date : null,
      ]);

      //   // Step 3: Insert data into PostgreSQL using raw queries
      const pgInsertQuery =
        'INSERT INTO todos (title, type, status, created_at, completed_at) VALUES ($1, $2, $3, $4, $5)';
      for (let i = 0; i < transformedTodos.length; i++) {
        await this.database.query(pgInsertQuery, transformedTodos[i]);
      }

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      await mongoClient.close();
    }
  }

  async migrateQaasData() {
    const mongoClient = new MongoClient(process.env.MONGO_URL);
    await mongoClient.connect();
    const mongoDb = mongoClient.db('joestodo');
    const mongoCollection = mongoDb.collection('qaas');

    try {
      // Step 1: Fetch data from MongoDB
      const qaas = await mongoCollection
        .find()
        .sort({ create_date: 1 })
        .toArray();
      console.log('qaas: ', qaas);

      // Step 2: Transform data (if needed)
      const transformedTodos = qaas.map((todo) => [
        todo.title,
        todo.description,
        todo.type,
        todo.create_date,
      ]);

      //   // Step 3: Insert data into PostgreSQL using raw queries
      const pgInsertQuery =
        'INSERT INTO qaas (question, answer, type, created_at) VALUES ($1, $2, $3, $4)';
      for (let i = 0; i < transformedTodos.length; i++) {
        await this.database.query(pgInsertQuery, transformedTodos[i]);
        console.log('Succesfully migrated qaa with id ' + qaas[i].id);
      }

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      await mongoClient.close();
    }
  }
}
