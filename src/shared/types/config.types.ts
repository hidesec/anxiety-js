import { Environment } from '../enums/common.enum';

/**
 * Application Configuration Type
 */
export type AppConfig = {
  port: number;
  environment: Environment;
  cors: boolean;
  bodyParser: boolean;
  globalPrefix?: string;
  logging: {
    level: string;
    enabled: boolean;
    colorize: boolean;
  };
  security: {
    helmet: boolean;
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      max: number;
    };
  };
};

/**
 * Database Configuration Type
 */
export type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
  poolSize?: number;
  timeout?: number;
};

/**
 * JWT Configuration Type
 */
export type JwtConfig = {
  secret: string;
  expiresIn: string;
  algorithm: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
  issuer?: string;
  audience?: string;
};

/**
 * Complete Application Configuration
 */
export type Configuration = {
  app: AppConfig;
  database?: DatabaseConfig;
  jwt?: JwtConfig;
  [key: string]: any;
};