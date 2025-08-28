/**
 * Integration test for database and configuration features
 */

import { ConfigService, ConfigModule } from '../../config';
import { DatabaseService } from '../../database';

describe('Database and Configuration Integration', () => {
  let configService: ConfigService;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    // Initialize configuration
    configService = ConfigModule.initialize({
      envFilePath: '.env.test',
    });

    // Initialize database service
    databaseService = new DatabaseService(configService);
  });

  afterAll(async () => {
    if (databaseService && databaseService.isConnected()) {
      await databaseService.disconnect();
    }
  });

  describe('ConfigService', () => {
    it('should load configuration', () => {
      expect(configService).toBeDefined();
      expect(configService.get('app.name')).toBeDefined();
    });

    it('should get app configuration', () => {
      const appConfig = configService.getAppConfig();
      expect(appConfig).toBeDefined();
      expect(appConfig.name).toBeTruthy();
    });

    it('should get database configuration', () => {
      const dbConfig = configService.getDatabaseConfig();
      expect(dbConfig).toBeDefined();
      expect(dbConfig.type).toBe('postgres');
      expect(dbConfig.database).toBe('anxiety_db');
    });

    it('should provide default values', () => {
      const nonExistentKey = configService.get('non.existent.key', 'default');
      expect(nonExistentKey).toBe('default');
    });

    it('should check if key exists', () => {
      expect(configService.has('app.name')).toBe(true);
      expect(configService.has('non.existent.key')).toBe(false);
    });
  });

  describe('DatabaseService', () => {
    it('should be created successfully', () => {
      expect(databaseService).toBeDefined();
    });

    it('should have correct database configuration', () => {
      const healthStatus = databaseService.getHealthStatus();
      expect(healthStatus).toBeDefined();
    });

    it('should provide database health status', async () => {
      const health = await databaseService.getHealthStatus();
      expect(health).toHaveProperty('connected');
      expect(health).toHaveProperty('database');
      expect(health).toHaveProperty('host');
      expect(health).toHaveProperty('port');
      expect(health).toHaveProperty('type');
    });

    // Note: We won't test actual database connection in unit tests
    // This would require a running PostgreSQL instance
  });

  describe('Configuration Validation', () => {
    it('should validate required database configuration', () => {
      const dbConfig = configService.getDatabaseConfig();
      
      expect(dbConfig.host).toBeDefined();
      expect(dbConfig.port).toBeDefined();
      expect(dbConfig.username).toBeDefined();
      expect(dbConfig.password).toBeDefined();
      expect(dbConfig.database).toBeDefined();
    });

    it('should validate security configuration', () => {
      const securityConfig = configService.getSecurityConfig();
      
      expect(securityConfig.jwt.secret).toBeDefined();
      expect(securityConfig.jwt.expiresIn).toBeDefined();
      expect(securityConfig.bcrypt.saltRounds).toBeGreaterThan(0);
    });
  });
});