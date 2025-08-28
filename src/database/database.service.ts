/**
 * Database service for the Anxiety framework with TypeORM integration
 */

import { DataSource, DataSourceOptions, Repository, EntityTarget, ObjectLiteral } from 'typeorm';
import { ConfigService } from '../config/config.service';
import { DatabaseConfig } from '../config/interfaces/config.interface';
import { Client } from 'pg';

/**
 * Database service interface
 */
export type DatabaseServiceInterface = {
  getDataSource(): DataSource;
  getRepository<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>): Repository<Entity>;
  isConnected(): boolean;
  connect(): Promise<DataSource>;
  disconnect(): Promise<void>;
  runMigrations(): Promise<void>;
  revertMigrations(): Promise<void>;
}

/**
 * DatabaseService provides TypeORM integration and database management
 */
export class DatabaseService implements DatabaseServiceInterface {
  private dataSource: DataSource | null = null;
  private readonly config: DatabaseConfig;

  constructor(configService: ConfigService) {
    this.config = configService.getDatabaseConfig();
    this.initializeDataSource();
  }

  /**
   * Initialize TypeORM DataSource
   */
  private initializeDataSource(): void {
    const options: DataSourceOptions = {
      type: this.config.type as any,
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      password: this.config.password,
      database: this.config.database,
      synchronize: this.config.synchronize,
      logging: this.config.logging,
      entities: this.config.entities,
      migrations: this.config.migrations,
      subscribers: [],
      // PostgreSQL specific options
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      extra: {
        connectionLimit: 10,
        acquireTimeout: 30000,
        timeout: 30000,
      },
    };

    this.dataSource = new DataSource(options);
  }

  /**
   * Get the TypeORM DataSource instance
   */
  getDataSource(): DataSource {
    if (!this.dataSource) {
      throw new Error('DataSource not initialized');
    }
    return this.dataSource;
  }

  /**
   * Get a repository for the specified entity
   */
  getRepository<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>): Repository<Entity> {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.dataSource.getRepository(entity);
  }

  /**
   * Check if database is connected
   */
  isConnected(): boolean {
    return this.dataSource?.isInitialized || false;
  }

  /**
   * Connect to the database
   */
  async connect(): Promise<DataSource> {
    try {
      if (this.dataSource?.isInitialized) {
        return this.dataSource;
      }

      if (!this.dataSource) {
        this.initializeDataSource();
      }

      const connectedDataSource = await this.dataSource!.initialize();
      
      if (process.env.NODE_ENV !== 'test') {
        console.log(`✅ Database connected successfully to ${this.config.host}:${this.config.port}/${this.config.database}`);
      }

      return connectedDataSource;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw new Error(`Failed to connect to database: ${error}`);
    }
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    try {
      if (this.dataSource?.isInitialized) {
        await this.dataSource.destroy();
        if (process.env.NODE_ENV !== 'test') {
          console.log('🔌 Database disconnected');
        }
      }
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw new Error(`Failed to disconnect from database: ${error}`);
    }
  }

  /**
   * Run pending migrations
   */
  async runMigrations(): Promise<void> {
    try {
      if (!this.dataSource?.isInitialized) {
        throw new Error('Database not connected');
      }

      const migrations = await this.dataSource.runMigrations();
      
      if (process.env.NODE_ENV !== 'test') {
        console.log(`📦 Ran ${migrations.length} migrations`);
      }
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw new Error(`Failed to run migrations: ${error}`);
    }
  }

  /**
   * Revert the last migration
   */
  async revertMigrations(): Promise<void> {
    try {
      if (!this.dataSource?.isInitialized) {
        throw new Error('Database not connected');
      }

      await this.dataSource.undoLastMigration();
      
      if (process.env.NODE_ENV !== 'test') {
        console.log('⏪ Reverted last migration');
      }
    } catch (error) {
      console.error('❌ Migration revert failed:', error);
      throw new Error(`Failed to revert migrations: ${error}`);
    }
  }

  /**
   * Create database if it doesn't exist (PostgreSQL specific)
   */
  async createDatabase(): Promise<void> {
    try {
      const client = new Client({
        host: this.config.host,
        port: this.config.port,
        user: this.config.username,
        password: this.config.password,
        database: 'postgres', // Connect to default database
      });

      await client.connect();
      
      // Check if database exists
      const result = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [this.config.database]
      );

      if (result.rowCount === 0) {
        await client.query(`CREATE DATABASE "${this.config.database}"`);
        if (process.env.NODE_ENV !== 'test') {
          console.log(`🗄️  Database '${this.config.database}' created`);
        }
      }

      await client.end();
    } catch (error) {
      console.error('❌ Database creation failed:', error);
      throw new Error(`Failed to create database: ${error}`);
    }
  }

  /**
   * Drop database (PostgreSQL specific) - USE WITH CAUTION
   */
  async dropDatabase(): Promise<void> {
    try {
      const client = new Client({
        host: this.config.host,
        port: this.config.port,
        user: this.config.username,
        password: this.config.password,
        database: 'postgres', // Connect to default database
      });

      await client.connect();
      
      // Terminate existing connections to the database
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid()
      `, [this.config.database]);

      // Drop the database
      await client.query(`DROP DATABASE IF EXISTS "${this.config.database}"`);
      
      if (process.env.NODE_ENV !== 'test') {
        console.log(`🗑️  Database '${this.config.database}' dropped`);
      }

      await client.end();
    } catch (error) {
      console.error('❌ Database drop failed:', error);
      throw new Error(`Failed to drop database: ${error}`);
    }
  }

  /**
   * Execute raw SQL query
   */
  async query(sql: string, parameters?: any[]): Promise<any> {
    try {
      if (!this.dataSource?.isInitialized) {
        throw new Error('Database not connected');
      }

      return await this.dataSource.query(sql, parameters);
    } catch (error) {
      console.error('❌ Query execution failed:', error);
      throw new Error(`Failed to execute query: ${error}`);
    }
  }

  /**
   * Get database health status
   */
  async getHealthStatus(): Promise<{
    connected: boolean;
    database: string;
    host: string;
    port: number;
    type: string;
    uptime?: number;
  }> {
    try {
      const status: {
        connected: boolean;
        database: string;
        host: string;
        port: number;
        type: string;
        uptime?: number;
      } = {
        connected: this.isConnected(),
        database: this.config.database,
        host: this.config.host,
        port: this.config.port,
        type: this.config.type,
      };

      if (this.isConnected()) {
        // Get database uptime for PostgreSQL
        try {
          const result = await this.query('SELECT EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) as uptime');
          status.uptime = Math.floor(result[0]?.uptime || 0);
        } catch {
          // Ignore uptime query errors
        }
      }

      return status;
    } catch (error) {
      return {
        connected: false,
        database: this.config.database,
        host: this.config.host,
        port: this.config.port,
        type: this.config.type,
      };
    }
  }
}