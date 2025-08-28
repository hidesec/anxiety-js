/**
 * Configuration interfaces for the Anxiety framework
 */

/**
 * Base configuration interface
 */
export type ConfigInterface = {
  get<T = any>(key: string): T;
  get<T = any>(key: string, defaultValue: T): T;
  has(key: string): boolean;
  getAll(): Record<string, any>;
}

/**
 * Application configuration
 */
export type AppConfig = {
  name: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
  port: number;
  host: string;
}

/**
 * Database configuration
 */
export type DatabaseConfig = {
  type: 'postgres' | 'mysql' | 'sqlite' | 'mariadb';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  entities: string[];
  migrations: string[];
  cli: {
    entitiesDir: string;
    migrationsDir: string;
  };
}

/**
 * Security configuration
 */
export type SecurityConfig = {
  jwt: {
    secret: string;
    expiresIn: string;
    algorithm: string;
  };
  bcrypt: {
    saltRounds: number;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

/**
 * Logging configuration
 */
export type LoggingConfig = {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'simple';
  file: {
    enabled: boolean;
    path: string;
    maxFiles: number;
    maxSize: string;
  };
  console: {
    enabled: boolean;
    colorize: boolean;
  };
}

/**
 * Cache configuration
 */
export type CacheConfig = {
  ttl: number;
  max: number;
  store: 'memory' | 'redis';
  redis?: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
}

/**
 * Complete application configuration
 */
export type AnxietyConfig = {
  app: AppConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
  cache: CacheConfig;
}

/**
 * Configuration module options
 */
export type ConfigModuleOptions = {
  envFilePath?: string | string[];
  ignoreEnvFile?: boolean;
  ignoreEnvVars?: boolean;
  validationSchema?: any;
  validationOptions?: {
    allowUnknown?: boolean;
    abortEarly?: boolean;
  };
  global?: boolean;
}