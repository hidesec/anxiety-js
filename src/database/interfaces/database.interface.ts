import { DataSource, Repository, EntityTarget, ObjectLiteral } from 'typeorm';

/**
 * Database connection interface
 */
export type DatabaseConnectionInterface = {
  connect(): Promise<DataSource>;
  disconnect(): Promise<void>;
  getDataSource(): DataSource;
  isConnected(): boolean;
}

/**
 * Repository provider interface
 */
export type RepositoryProviderInterface = {
  getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T>;
  createRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T>;
}

/**
 * Transaction manager interface
 */
export type TransactionManagerInterface = {
  transaction<T>(fn: (manager: any) => Promise<T>): Promise<T>;
  startTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
}

/**
 * Database health check result
 */
export type DatabaseHealthCheck = {
  status: 'ok' | 'error';
  message: string;
  details?: any;
  timestamp: string;
  connectionTime?: number;
}

/**
 * Migration interface
 */
export type MigrationInterface = {
  name: string;
  timestamp: number;
  up(): Promise<void>;
  down(): Promise<void>;
}

/**
 * Database module options
 */
export type DatabaseModuleOptions = {
  autoConnect?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  synchronize?: boolean;
  runMigrations?: boolean;
  entities?: (new (...args: unknown[]) => object)[];
  repositories?: (new (...args: unknown[]) => object)[];
}

/**
 * Connection pool options
 */
export type ConnectionPoolOptions = {
  max: number;
  min: number;
  acquire: number;
  idle: number;
  evict: number;
  validate: boolean;
}

/**
 * Query result metadata
 */
export type QueryMetadata = {
  affectedRows?: number;
  insertId?: number;
  executionTime: number;
  query: string;
  parameters?: any[];
}

/**
 * Pagination options
 */
export type PaginationOptions = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Pagination result
 */
export type PaginationResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}