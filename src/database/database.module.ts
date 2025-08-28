/**
 * Database module for the Anxiety framework
 */

import { EntityTarget, ObjectLiteral } from 'typeorm';
import { DatabaseService } from './database.service';
import { ConfigService } from '../config/config.service';

/**
 * DatabaseModule provides database connectivity and ORM integration
 */
export class DatabaseModule {
  private static databaseService: DatabaseService;
  private static entities: EntityTarget<ObjectLiteral>[] = [];

  /**
   * Create a DatabaseModule for root application
   * @param options Database configuration options
   */
  static forRoot(options: DatabaseModuleOptions = {}): DatabaseModuleForRoot {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DatabaseService,
          useFactory: async (configService: ConfigService) => {
            this.databaseService = new DatabaseService(configService);
            
            // Auto-connect if specified
            if (options.autoConnect !== false) {
              await this.databaseService.connect();
            }

            // Run migrations if specified
            if (options.runMigrations === true) {
              await this.databaseService.runMigrations();
            }

            // Make database service globally available
            (global as any).databaseService = this.databaseService;

            return this.databaseService;
          },
          deps: [ConfigService],
        },
      ],
      exports: [DatabaseService],
      global: options.global !== false,
    };
  }

  /**
   * Create a DatabaseModule for feature modules with entities
   * @param entities Entity classes to register
   */
  static forFeature(entities: EntityTarget<ObjectLiteral>[] = []): DatabaseModuleForFeature {
    if (!this.databaseService) {
      throw new Error('DatabaseModule.forRoot() must be called before forFeature()');
    }

    // Register entities
    this.entities.push(...entities);

    const repositoryProviders = entities.map(entity => {
      const entityName = typeof entity === 'string' ? entity : (entity as any).name || entity.constructor.name;
      return {
        provide: `${entityName}Repository`,
        useFactory: (databaseService: DatabaseService) => {
          return databaseService.getRepository(entity);
        },
        deps: [DatabaseService],
      };
    });

    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DatabaseService,
          useValue: this.databaseService,
        },
        ...repositoryProviders,
      ],
      exports: [DatabaseService, ...repositoryProviders.map(p => p.provide)],
    };
  }

  /**
   * Get the current database service instance
   */
  static getDatabaseService(): DatabaseService {
    if (!this.databaseService) {
      throw new Error('DatabaseModule not initialized. Call DatabaseModule.forRoot() first.');
    }
    return this.databaseService;
  }

  /**
   * Register database service in a container
   */
  static register(container: any, configService: ConfigService): void {
    if (!this.databaseService) {
      this.databaseService = new DatabaseService(configService);
    }
    
    container.register('DatabaseService', this.databaseService);
    (global as any).databaseService = this.databaseService;
  }

  /**
   * Initialize database for standalone usage
   */
  static async initialize(configService: ConfigService, options: DatabaseModuleOptions = {}): Promise<DatabaseService> {
    this.databaseService = new DatabaseService(configService);
    
    if (options.autoConnect !== false) {
      await this.databaseService.connect();
    }

    if (options.runMigrations === true) {
      await this.databaseService.runMigrations();
    }

    (global as any).databaseService = this.databaseService;
    return this.databaseService;
  }

  /**
   * Get all registered entities
   */
  static getEntities(): EntityTarget<ObjectLiteral>[] {
    return this.entities;
  }

  /**
   * Close database connections
   */
  static async close(): Promise<void> {
    if (this.databaseService) {
      await this.databaseService.disconnect();
    }
  }
}

/**
 * Database module options
 */
export type DatabaseModuleOptions = {
  /** Automatically connect to database on module initialization */
  autoConnect?: boolean;
  /** Run migrations automatically on startup */
  runMigrations?: boolean;
  /** Make the module global */
  global?: boolean;
  /** Additional TypeORM options */
  typeormOptions?: any;
}

/**
 * Interface for DatabaseModule.forRoot() return type
 */
export type DatabaseModuleForRoot = {
  module: typeof DatabaseModule;
  providers: any[];
  exports: any[];
  global: boolean;
}

/**
 * Interface for DatabaseModule.forFeature() return type
 */
export type DatabaseModuleForFeature = {
  module: typeof DatabaseModule;
  providers: any[];
  exports: any[];
}

/**
 * Database provider factory
 */
export function createDatabaseProvider(configService: ConfigService, options: DatabaseModuleOptions = {}) {
  return {
    provide: DatabaseService,
    useFactory: async () => {
      const databaseService = new DatabaseService(configService);
      
      if (options.autoConnect !== false) {
        await databaseService.connect();
      }

      return databaseService;
    },
  };
}

/**
 * Repository provider factory
 */
export function createRepositoryProvider(entity: EntityTarget<ObjectLiteral>) {
  const entityName = typeof entity === 'string' ? entity : (entity as any).name || entity.constructor.name;
  return {
    provide: `${entityName}Repository`,
    useFactory: (databaseService: DatabaseService) => {
      return databaseService.getRepository(entity);
    },
    deps: [DatabaseService],
  };
}

/**
 * Global database helper functions
 */
export class DatabaseHelper {
  /**
   * Get database service from global scope
   */
  static getDatabaseService(): DatabaseService {
    const databaseService = (global as any).databaseService as DatabaseService;
    if (!databaseService) {
      throw new Error('Global DatabaseService not available. Initialize DatabaseModule first.');
    }
    return databaseService;
  }

  /**
   * Get repository for entity
   */
  static getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>) {
    return this.getDatabaseService().getRepository(entity);
  }

  /**
   * Check if database is connected
   */
  static isConnected(): boolean {
    try {
      return this.getDatabaseService().isConnected();
    } catch {
      return false;
    }
  }

  /**
   * Get database health status
   */
  static async getHealthStatus() {
    try {
      return await this.getDatabaseService().getHealthStatus();
    } catch {
      return {
        connected: false,
        database: 'unknown',
        host: 'unknown',
        port: 0,
        type: 'unknown',
      };
    }
  }

  /**
   * Execute raw SQL query
   */
  static async query(sql: string, parameters?: any[]): Promise<any> {
    return this.getDatabaseService().query(sql, parameters);
  }

  /**
   * Create database transaction
   */
  static async transaction<T>(callback: (manager: any) => Promise<T>): Promise<T> {
    const dataSource = this.getDatabaseService().getDataSource();
    return dataSource.transaction(callback);
  }
}