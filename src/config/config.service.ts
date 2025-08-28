/**
 * Configuration service for the Anxiety framework
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as Joi from 'joi';
import { ConfigInterface, AnxietyConfig, ConfigModuleOptions } from './interfaces/config.interface';
import { anxietyConfigSchema, defaultValidationOptions } from './schemas/config.schema';

/**
 * ConfigService provides hierarchical configuration management with validation
 */
export class ConfigService implements ConfigInterface {
  private readonly configData: Record<string, any> = {};
  private readonly validationSchema?: Joi.ObjectSchema;
  private readonly options: Required<ConfigModuleOptions>;

  constructor(options: ConfigModuleOptions = {}) {
    this.options = {
      envFilePath: options.envFilePath || ['.env'],
      ignoreEnvFile: options.ignoreEnvFile || false,
      ignoreEnvVars: options.ignoreEnvVars || false,
      global: options.global || false,
      validationSchema: options.validationSchema || anxietyConfigSchema,
      validationOptions: {
        ...defaultValidationOptions,
        ...options.validationOptions,
      },
    };

    this.validationSchema = this.options.validationSchema;
    this.loadConfiguration();
  }

  /**
   * Get configuration value by key
   */
  get<T = any>(key: string): T | undefined;
  get<T = any>(key: string, defaultValue: T): T;
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    const value = this.getNestedValue(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Check if configuration key exists
   */
  has(key: string): boolean {
    return this.getNestedValue(key) !== undefined;
  }

  /**
   * Get all configuration data
   */
  getAll(): Record<string, any> {
    return { ...this.configData };
  }

  /**
   * Get typed configuration for specific section
   */
  getConfig(): AnxietyConfig {
    return this.configData as AnxietyConfig;
  }

  /**
   * Get app configuration
   */
  getAppConfig() {
    return this.get('app');
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig() {
    return this.get('database');
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    return this.get('security');
  }

  /**
   * Get logging configuration
   */
  getLoggingConfig() {
    return this.get('logging');
  }

  /**
   * Get cache configuration
   */
  getCacheConfig() {
    return this.get('cache');
  }

  /**
   * Load configuration from multiple sources
   */
  private loadConfiguration(): void {
    const config: Record<string, any> = {};

    // Load from environment files
    if (!this.options.ignoreEnvFile) {
      this.loadFromEnvFiles(config);
    }

    // Load from environment variables
    if (!this.options.ignoreEnvVars) {
      this.loadFromEnvVars(config);
    }

    // Build hierarchical configuration
    this.buildHierarchicalConfig(config);

    // Validate configuration
    if (this.validationSchema) {
      this.validateConfiguration();
    }
  }

  /**
   * Load configuration from .env files
   */
  private loadFromEnvFiles(config: Record<string, any>): void {
    const envFilePaths = Array.isArray(this.options.envFilePath) 
      ? this.options.envFilePath 
      : [this.options.envFilePath];

    for (const envPath of envFilePaths) {
      const resolvedPath = path.resolve(envPath);
      if (fs.existsSync(resolvedPath)) {
        const result = dotenv.config({ path: resolvedPath });
        if (result.parsed) {
          Object.assign(config, result.parsed);
        }
      }
    }
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvVars(config: Record<string, any>): void {
    Object.assign(config, process.env);
  }

  /**
   * Build hierarchical configuration structure
   */
  private buildHierarchicalConfig(flatConfig: Record<string, any>): void {
    // Application configuration
    this.configData.app = {
      name: flatConfig.APP_NAME || 'anxiety-app',
      version: flatConfig.APP_VERSION || '1.0.0',
      environment: flatConfig.NODE_ENV || 'development',
      debug: this.parseBoolean(flatConfig.APP_DEBUG, false),
      port: this.parseNumber(flatConfig.PORT || flatConfig.APP_PORT, 3000),
      host: flatConfig.APP_HOST || 'localhost',
    };

    // Database configuration
    this.configData.database = {
      type: flatConfig.DB_TYPE || 'postgres',
      host: flatConfig.DB_HOST || 'localhost',
      port: this.parseNumber(flatConfig.DB_PORT, 5432),
      username: flatConfig.DB_USERNAME || flatConfig.DB_USER || 'postgres',
      password: flatConfig.DB_PASSWORD || 'postgres',
      database: flatConfig.DB_DATABASE || flatConfig.DB_NAME || 'anxiety_db',
      synchronize: this.parseBoolean(flatConfig.DB_SYNCHRONIZE, false),
      logging: this.parseBoolean(flatConfig.DB_LOGGING, false),
      entities: this.parseArray(flatConfig.DB_ENTITIES, ['src/**/*.entity{.ts,.js}']),
      migrations: this.parseArray(flatConfig.DB_MIGRATIONS, ['src/migrations/*{.ts,.js}']),
      cli: {
        entitiesDir: flatConfig.DB_ENTITIES_DIR || 'src/entities',
        migrationsDir: flatConfig.DB_MIGRATIONS_DIR || 'src/migrations',
      },
    };

    // Security configuration
    this.configData.security = {
      jwt: {
        secret: flatConfig.JWT_SECRET || this.generateJwtSecret(),
        expiresIn: flatConfig.JWT_EXPIRES_IN || '1h',
        algorithm: flatConfig.JWT_ALGORITHM || 'HS256',
      },
      bcrypt: {
        saltRounds: this.parseNumber(flatConfig.BCRYPT_SALT_ROUNDS, 10),
      },
      cors: {
        origin: this.parseStringOrArray(flatConfig.CORS_ORIGIN, '*'),
        credentials: this.parseBoolean(flatConfig.CORS_CREDENTIALS, true),
      },
    };

    // Logging configuration
    this.configData.logging = {
      level: flatConfig.LOG_LEVEL || 'info',
      format: flatConfig.LOG_FORMAT || 'simple',
      file: {
        enabled: this.parseBoolean(flatConfig.LOG_FILE_ENABLED, false),
        path: flatConfig.LOG_FILE_PATH || 'logs/app.log',
        maxFiles: this.parseNumber(flatConfig.LOG_FILE_MAX_FILES, 5),
        maxSize: flatConfig.LOG_FILE_MAX_SIZE || '10m',
      },
      console: {
        enabled: this.parseBoolean(flatConfig.LOG_CONSOLE_ENABLED, true),
        colorize: this.parseBoolean(flatConfig.LOG_CONSOLE_COLORIZE, true),
      },
    };

    // Cache configuration
    this.configData.cache = {
      ttl: this.parseNumber(flatConfig.CACHE_TTL, 300),
      max: this.parseNumber(flatConfig.CACHE_MAX, 100),
      store: flatConfig.CACHE_STORE || 'memory',
      redis: flatConfig.CACHE_STORE === 'redis' ? {
        host: flatConfig.REDIS_HOST || 'localhost',
        port: this.parseNumber(flatConfig.REDIS_PORT, 6379),
        password: flatConfig.REDIS_PASSWORD || undefined,
        db: this.parseNumber(flatConfig.REDIS_DB, 0),
      } : undefined,
    };
  }

  /**
   * Validate configuration using Joi schema
   */
  private validateConfiguration(): void {
    if (!this.validationSchema) {
      return;
    }

    const { error, value } = this.validationSchema.validate(
      this.configData,
      this.options.validationOptions
    );

    if (error) {
      throw new Error(`Configuration validation failed: ${error.message}`);
    }

    // Use validated and transformed values
    Object.assign(this.configData, value);
  }

  /**
   * Get nested value from configuration using dot notation
   */
  private getNestedValue(key: string): any {
    const keys = key.split('.');
    let value = this.configData;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Parse boolean value from string
   */
  private parseBoolean(value: any, defaultValue: boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return defaultValue;
  }

  /**
   * Parse number value from string
   */
  private parseNumber(value: any, defaultValue: number): number {
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Parse array value from string
   */
  private parseArray(value: any, defaultValue: string[]): string[] {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim());
    }
    return defaultValue;
  }

  /**
   * Parse string or array value
   */
  private parseStringOrArray(value: any, defaultValue: string | string[]): string | string[] {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      if (value.includes(',')) {
        return value.split(',').map(item => item.trim());
      }
      return value;
    }
    return defaultValue;
  }

  /**
   * Generate a secure JWT secret if not provided
   */
  private generateJwtSecret(): string {
    if (this.configData.app?.environment === 'production') {
      throw new Error('JWT_SECRET must be provided in production environment');
    }
    // Generate a random secret for development/test
    return Buffer.from(Math.random().toString()).toString('base64').slice(0, 32);
  }
}