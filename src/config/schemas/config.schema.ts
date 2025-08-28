/**
 * Configuration validation schemas for the Anxiety framework
 */

import 'reflect-metadata';
import { IsBoolean, IsEnum, IsNumber, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import * as Joi from 'joi';

/**
 * Database CLI configuration schema
 */
export class DatabaseCliSchema {
  @IsString()
  entitiesDir = 'src/database/entities';

  @IsString()
  migrationsDir = 'src/database/migrations';
}

/**
 * Application configuration validation schema
 */
export class AppConfigSchema {
  @IsString()
  name = 'anxiety-app';

  @IsString()
  version = '1.0.0';

  @IsEnum(['development', 'production', 'test'])
  environment: 'development' | 'production' | 'test' = 'development';

  @IsBoolean()
  debug = true;

  @IsNumber()
  port = 3001;

  @IsString()
  host = 'localhost';
}

/**
 * Database configuration validation schema
 */
export class DatabaseConfigSchema {
  @IsEnum(['postgres', 'mysql', 'sqlite', 'mariadb'])
  type: 'postgres' | 'mysql' | 'sqlite' | 'mariadb' = 'postgres';

  @IsString()
  host = 'localhost';

  @IsNumber()
  port = 5432;

  @IsString()
  username = 'postgres';

  @IsString()
  password = 'postgres';

  @IsString()
  database = 'anxiety_db';

  @IsBoolean()
  synchronize = false;

  @IsBoolean()
  logging = false;

  @IsArray()
  @IsString({ each: true })
  entities: string[] = ['dist/**/*.entity{.ts,.js}'];

  @IsArray()
  @IsString({ each: true })
  migrations: string[] = ['dist/migrations/*{.ts,.js}'];

  @ValidateNested()
  @Type(() => DatabaseCliSchema)
  cli!: DatabaseCliSchema;
}

/**
 * JWT configuration schema
 */
export class JwtConfigSchema {
  @IsString()
  secret = 'your-secret-key';

  @IsString()
  expiresIn = '1h';

  @IsString()
  algorithm = 'HS256';
}

/**
 * Bcrypt configuration schema
 */
export class BcryptConfigSchema {
  @IsNumber()
  saltRounds = 10;
}

/**
 * CORS configuration schema
 */
export class CorsConfigSchema {
  @IsString()
  origin: string | string[] = '*';

  @IsBoolean()
  credentials = true;
}

/**
 * Security configuration validation schema
 */
export class SecurityConfigSchema {
  @ValidateNested()
  @Type(() => JwtConfigSchema)
  jwt!: JwtConfigSchema;

  @ValidateNested()
  @Type(() => BcryptConfigSchema)
  bcrypt!: BcryptConfigSchema;

  @ValidateNested()
  @Type(() => CorsConfigSchema)
  cors!: CorsConfigSchema;
}

/**
 * File logging configuration schema
 */
export class FileLoggingSchema {
  @IsBoolean()
  enabled = true;

  @IsString()
  path = 'logs';

  @IsNumber()
  maxFiles = 5;

  @IsString()
  maxSize = '10m';
}

/**
 * Console logging configuration schema
 */
export class ConsoleLoggingSchema {
  @IsBoolean()
  enabled = true;

  @IsBoolean()
  colorize = true;
}

/**
 * Logging configuration validation schema
 */
export class LoggingConfigSchema {
  @IsEnum(['error', 'warn', 'info', 'debug'])
  level: 'error' | 'warn' | 'info' | 'debug' = 'info';

  @IsEnum(['json', 'simple'])
  format: 'json' | 'simple' = 'simple';

  @ValidateNested()
  @Type(() => FileLoggingSchema)
  file!: FileLoggingSchema;

  @ValidateNested()
  @Type(() => ConsoleLoggingSchema)
  console!: ConsoleLoggingSchema;
}

/**
 * Redis configuration schema
 */
export class RedisConfigSchema {
  @IsString()
  host = 'localhost';

  @IsNumber()
  port = 6379;

  @IsOptional()
  @IsString()
  password?: string;

  @IsNumber()
  db = 0;
}

/**
 * Cache configuration validation schema
 */
export class CacheConfigSchema {
  @IsNumber()
  ttl = 300;

  @IsNumber()
  max = 100;

  @IsEnum(['memory', 'redis'])
  store: 'memory' | 'redis' = 'memory';

  @IsOptional()
  @ValidateNested()
  @Type(() => RedisConfigSchema)
  redis?: RedisConfigSchema;
}

/**
 * Complete configuration validation schema
 */
export class AnxietyConfigSchema {
  @ValidateNested()
  @Type(() => AppConfigSchema)
  app!: AppConfigSchema;

  @ValidateNested()
  @Type(() => DatabaseConfigSchema)
  database!: DatabaseConfigSchema;

  @ValidateNested()
  @Type(() => SecurityConfigSchema)
  security!: SecurityConfigSchema;

  @ValidateNested()
  @Type(() => LoggingConfigSchema)
  logging!: LoggingConfigSchema;

  @ValidateNested()
  @Type(() => CacheConfigSchema)
  cache!: CacheConfigSchema;
}

// ================================
// JOI VALIDATION SCHEMAS
// ================================

/**
 * Application Joi validation schema
 */
export const appConfigSchema = Joi.object({
  name: Joi.string().default('anxiety-app'),
  version: Joi.string().default('1.0.0'),
  environment: Joi.string().valid('development', 'production', 'test').default('development'),
  debug: Joi.boolean().default(true),
  port: Joi.number().default(3001),
  host: Joi.string().default('localhost'),
});

/**
 * Database Joi validation schema
 */
export const databaseConfigSchema = Joi.object({
  type: Joi.string().valid('postgres', 'mysql', 'sqlite', 'mariadb').default('postgres'),
  host: Joi.string().default('localhost'),
  port: Joi.number().default(5432),
  username: Joi.string().default('postgres'),
  password: Joi.string().allow('').default(''),
  database: Joi.string().default('anxiety_db'),
  synchronize: Joi.boolean().default(false),
  logging: Joi.boolean().default(false),
  entities: Joi.array().items(Joi.string()).default(['dist/**/*.entity{.ts,.js}']),
  migrations: Joi.array().items(Joi.string()).default(['dist/migrations/*{.ts,.js}']),
  cli: Joi.object({
    entitiesDir: Joi.string().default('src/database/entities'),
    migrationsDir: Joi.string().default('src/database/migrations'),
  }),
});

/**
 * Security Joi validation schema
 */
export const securityConfigSchema = Joi.object({
  jwt: Joi.object({
    secret: Joi.string().required(),
    expiresIn: Joi.string().default('1h'),
    algorithm: Joi.string().default('HS256'),
  }),
  bcrypt: Joi.object({
    saltRounds: Joi.number().default(10),
  }),
  cors: Joi.object({
    origin: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).default('*'),
    credentials: Joi.boolean().default(true),
  }),
});

/**
 * Logging Joi validation schema
 */
export const loggingConfigSchema = Joi.object({
  level: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  format: Joi.string().valid('json', 'simple').default('simple'),
  file: Joi.object({
    enabled: Joi.boolean().default(true),
    path: Joi.string().default('logs'),
    maxFiles: Joi.number().default(5),
    maxSize: Joi.string().default('10m'),
  }),
  console: Joi.object({
    enabled: Joi.boolean().default(true),
    colorize: Joi.boolean().default(true),
  }),
});

/**
 * Cache Joi validation schema
 */
export const cacheConfigSchema = Joi.object({
  ttl: Joi.number().default(300),
  max: Joi.number().default(100),
  store: Joi.string().valid('memory', 'redis').default('memory'),
  redis: Joi.object({
    host: Joi.string().default('localhost'),
    port: Joi.number().default(6379),
    password: Joi.string().allow('').optional(),
    db: Joi.number().default(0),
  }).optional(),
});

/**
 * Complete Anxiety framework configuration validation schema
 */
export const anxietyConfigSchema = Joi.object({
  app: appConfigSchema,
  database: databaseConfigSchema,
  security: securityConfigSchema,
  logging: loggingConfigSchema,
  cache: cacheConfigSchema,
});

/**
 * Default validation options for Joi
 */
export const defaultValidationOptions = {
  allowUnknown: true,
  abortEarly: false,
  stripUnknown: false,
};