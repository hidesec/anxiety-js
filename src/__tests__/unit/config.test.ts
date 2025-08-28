/**
 * Unit tests for ConfigService
 */

import { ConfigService } from '../../config/config.service';
import { ConfigModuleOptions } from '../../config/interfaces/config.interface';

describe('ConfigService', () => {
  let configService: ConfigService;

  beforeEach(() => {
    // Reset environment variables
    delete process.env.TEST_VALUE;
    delete process.env.APP_NAME;
    delete process.env.DB_HOST;
  });

  afterEach(() => {
    // Clean up
    delete process.env.TEST_VALUE;
    delete process.env.APP_NAME;
    delete process.env.APP_PORT;
    delete process.env.PORT;
    delete process.env.DB_HOST;
  });

  describe('Initialization', () => {
    it('should create ConfigService with default options', () => {
      configService = new ConfigService();
      expect(configService).toBeDefined();
    });

    it('should create ConfigService with custom options', () => {
      const options: ConfigModuleOptions = {
        envFilePath: '.env.test',
        ignoreEnvFile: true,
        ignoreEnvVars: false,
      };
      configService = new ConfigService(options);
      expect(configService).toBeDefined();
    });

    it('should load configuration from environment variables', () => {
      process.env.APP_NAME = 'test-app';
      process.env.DB_HOST = 'test-host';
      
      configService = new ConfigService();
      
      expect(configService.get('app.name')).toBe('test-app');
      expect(configService.get('database.host')).toBe('test-host');
    });
  });

  describe('Configuration Access', () => {
    beforeEach(() => {
      process.env.APP_NAME = 'test-app';
      process.env.APP_PORT = '8080';
      process.env.DB_HOST = 'localhost';
      process.env.DB_PORT = '5432';
      // Ignore .env file to prevent interference with test env vars
      configService = new ConfigService({ ignoreEnvFile: true });
    });

    it('should get configuration values with dot notation', () => {
      expect(configService.get('app.name')).toBe('test-app');
      expect(configService.get('app.port')).toBe(8080); // From APP_PORT env var
      expect(configService.get('database.host')).toBe('localhost');
      expect(configService.get('database.port')).toBe(5432);
    });

    it('should return undefined for non-existent keys', () => {
      expect(configService.get('non.existent.key')).toBeUndefined();
    });

    it('should return default values for non-existent keys', () => {
      expect(configService.get('non.existent.key', 'default')).toBe('default');
      expect(configService.get('non.existent.number', 42)).toBe(42);
      expect(configService.get('non.existent.boolean', true)).toBe(true);
    });

    it('should check if configuration keys exist', () => {
      expect(configService.has('app.name')).toBe(true);
      expect(configService.has('database.host')).toBe(true);
      expect(configService.has('non.existent.key')).toBe(false);
    });

    it('should get all configuration data', () => {
      const allConfig = configService.getAll();
      expect(allConfig).toBeDefined();
      expect(allConfig.app).toBeDefined();
      expect(allConfig.database).toBeDefined();
      expect(allConfig.app.name).toBe('test-app');
    });
  });

  describe('Typed Configuration Access', () => {
    beforeEach(() => {
      process.env.APP_NAME = 'test-app';
      process.env.NODE_ENV = 'test';
      process.env.DB_TYPE = 'postgres';
      configService = new ConfigService();
    });

    it('should get app configuration', () => {
      const appConfig = configService.getAppConfig();
      expect(appConfig).toBeDefined();
      expect(appConfig.name).toBe('test-app');
      expect(appConfig.environment).toBe('test');
    });

    it('should get database configuration', () => {
      const dbConfig = configService.getDatabaseConfig();
      expect(dbConfig).toBeDefined();
      expect(dbConfig.type).toBe('postgres');
      expect(dbConfig.host).toBeDefined();
      expect(dbConfig.port).toBeDefined();
    });

    it('should get security configuration', () => {
      const securityConfig = configService.getSecurityConfig();
      expect(securityConfig).toBeDefined();
      expect(securityConfig.jwt).toBeDefined();
      expect(securityConfig.jwt.secret).toBeDefined();
      expect(securityConfig.bcrypt.saltRounds).toBeGreaterThan(0);
    });

    it('should get logging configuration', () => {
      const loggingConfig = configService.getLoggingConfig();
      expect(loggingConfig).toBeDefined();
      expect(loggingConfig.level).toBeDefined();
      expect(loggingConfig.format).toBeDefined();
    });

    it('should get cache configuration', () => {
      const cacheConfig = configService.getCacheConfig();
      expect(cacheConfig).toBeDefined();
      expect(cacheConfig.ttl).toBeGreaterThan(0);
      expect(cacheConfig.max).toBeGreaterThan(0);
    });
  });

  describe('Data Type Parsing', () => {
    beforeEach(() => {
      // Clear existing env vars first
      delete process.env.PORT;
      delete process.env.APP_PORT;
      
      // Set test-specific values
      process.env.APP_DEBUG = 'true';
      process.env.APP_PORT = '3000';  // This should result in app.port = 3000
      process.env.CACHE_TTL = '300';
      process.env.DB_SYNCHRONIZE = 'false';
      process.env.CORS_ORIGIN = 'http://localhost:3000,http://localhost:8080';
      // Ignore .env file to prevent interference with test env vars
      configService = new ConfigService({ ignoreEnvFile: true });
    });

    it('should parse boolean values correctly', () => {
      expect(configService.get('app.debug')).toBe(true);
      expect(configService.get('database.synchronize')).toBe(false);
    });

    it('should parse number values correctly', () => {
      expect(configService.get('app.port')).toBe(3000); // From APP_PORT env var set in test
      expect(configService.get('cache.ttl')).toBe(300);
    });

    it('should parse array values correctly', () => {
      const corsOrigin = configService.get('security.cors.origin');
      expect(Array.isArray(corsOrigin)).toBe(true);
      expect(corsOrigin).toContain('http://localhost:3000');
      expect(corsOrigin).toContain('http://localhost:8080');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate configuration with default schema', () => {
      process.env.DB_USERNAME = 'testuser';
      process.env.DB_PASSWORD = 'testpass';
      process.env.DB_DATABASE = 'testdb';
      
      expect(() => {
        configService = new ConfigService();
      }).not.toThrow();
    });

    it('should generate JWT secret for non-production environments', () => {
      process.env.NODE_ENV = 'development';
      configService = new ConfigService();
      
      const jwtSecret = configService.get('security.jwt.secret');
      expect(jwtSecret).toBeDefined();
      expect(typeof jwtSecret).toBe('string');
      expect(jwtSecret.length).toBeGreaterThan(0);
    });
  });

  describe('Hierarchical Configuration', () => {
    it('should build hierarchical structure from flat environment variables', () => {
      process.env.APP_NAME = 'test-app';
      process.env.APP_VERSION = '2.0.0';
      process.env.DB_HOST = 'test-host';
      process.env.DB_PORT = '5433';
      
      configService = new ConfigService();
      
      expect(configService.get('app.name')).toBe('test-app');
      expect(configService.get('app.version')).toBe('2.0.0');
      expect(configService.get('database.host')).toBe('test-host');
      expect(configService.get('database.port')).toBe(5433);
    });

    it('should handle nested configuration access', () => {
      process.env.JWT_SECRET = 'test-secret';
      process.env.JWT_EXPIRES_IN = '2h';
      process.env.BCRYPT_SALT_ROUNDS = '12';
      
      configService = new ConfigService();
      
      expect(configService.get('security.jwt.secret')).toBe('test-secret');
      expect(configService.get('security.jwt.expiresIn')).toBe('2h');
      expect(configService.get('security.bcrypt.saltRounds')).toBe(12);
    });
  });
});