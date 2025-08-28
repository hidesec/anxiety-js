/**
 * Unit tests for DatabaseService
 */

import { DatabaseService } from '../../database/database.service';
import { ConfigService } from '../../config/config.service';
import { Client } from 'pg';

// Mock TypeORM DataSource
const mockDataSource = {
  initialize: jest.fn(),
  destroy: jest.fn(),
  getRepository: jest.fn(),
  query: jest.fn(),
  runMigrations: jest.fn(),
  undoLastMigration: jest.fn(),
  transaction: jest.fn(),
  isInitialized: false
};

jest.mock('typeorm', () => ({
  DataSource: jest.fn().mockImplementation(() => mockDataSource),
}));

// Mock pg Client
jest.mock('pg', () => ({
  Client: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue({ rowCount: 0 }),
    end: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let configService: ConfigService;

  beforeEach(() => {
    // Reset mock state
    jest.clearAllMocks();
    mockDataSource.isInitialized = false;
    
    // Setup test environment variables
    process.env.NODE_ENV = 'test';
    process.env.DB_TYPE = 'postgres';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_USERNAME = 'testuser';
    process.env.DB_PASSWORD = 'testpass';
    process.env.DB_DATABASE = 'testdb';
    
    configService = new ConfigService();
    databaseService = new DatabaseService(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create DatabaseService with ConfigService', () => {
      expect(databaseService).toBeDefined();
      expect(databaseService).toBeInstanceOf(DatabaseService);
    });

    it('should initialize DataSource with correct configuration', () => {
      const dataSource = databaseService.getDataSource();
      expect(dataSource).toBeDefined();
    });

    it('should have correct database configuration', async () => {
      const healthStatus = await databaseService.getHealthStatus();
      expect(healthStatus.database).toBe('testdb');
      expect(healthStatus.host).toBe('localhost');
      expect(healthStatus.port).toBe(5432);
      expect(healthStatus.type).toBe('postgres');
    });
  });

  describe('Connection Management', () => {
    it('should connect to database successfully', async () => {
      mockDataSource.initialize.mockResolvedValue(mockDataSource);
      
      const result = await databaseService.connect();
      expect(result).toBeDefined();
      expect(mockDataSource.initialize).toHaveBeenCalled();
    });

    it('should return existing connection if already connected', async () => {
      mockDataSource.isInitialized = true;
      
      const result = await databaseService.connect();
      expect(result).toBe(mockDataSource);
    });

    it('should disconnect from database successfully', async () => {
      mockDataSource.isInitialized = true;
      mockDataSource.destroy.mockResolvedValue(undefined);
      
      await databaseService.disconnect();
      expect(mockDataSource.destroy).toHaveBeenCalled();
    });

    it('should check connection status correctly', () => {
      mockDataSource.isInitialized = true;
      expect(databaseService.isConnected()).toBe(true);
      
      mockDataSource.isInitialized = false;
      expect(databaseService.isConnected()).toBe(false);
    });
  });

  describe('Repository Management', () => {
    it('should get repository for entity', async () => {
      mockDataSource.isInitialized = true;
      const mockRepository = { find: jest.fn(), save: jest.fn() };
      mockDataSource.getRepository.mockReturnValue(mockRepository);
      
      const repository = databaseService.getRepository('User');
      expect(repository).toBe(mockRepository);
      expect(mockDataSource.getRepository).toHaveBeenCalledWith('User');
    });

    it('should throw error when getting repository without connection', () => {
      mockDataSource.isInitialized = false;
      
      expect(() => {
        databaseService.getRepository('User');
      }).toThrow('Database not connected. Call connect() first.');
    });
  });

  describe('Migration Management', () => {
    it('should run migrations successfully', async () => {
      mockDataSource.isInitialized = true;
      mockDataSource.runMigrations.mockResolvedValue([]);
      
      await databaseService.runMigrations();
      expect(mockDataSource.runMigrations).toHaveBeenCalled();
    });

    it('should revert migrations successfully', async () => {
      mockDataSource.isInitialized = true;
      mockDataSource.undoLastMigration.mockResolvedValue(undefined);
      
      await databaseService.revertMigrations();
      expect(mockDataSource.undoLastMigration).toHaveBeenCalled();
    });

    it('should throw error when running migrations without connection', async () => {
      mockDataSource.isInitialized = false;
      
      await expect(databaseService.runMigrations()).rejects.toThrow('Database not connected');
    });
  });

  describe('Query Execution', () => {
    it('should execute raw SQL queries', async () => {
      mockDataSource.isInitialized = true;
      const mockResult = [{ id: 1, name: 'test' }];
      mockDataSource.query.mockResolvedValue(mockResult);
      
      const result = await databaseService.query('SELECT * FROM users WHERE id = $1', [1]);
      expect(result).toBe(mockResult);
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    });

    it('should throw error when executing query without connection', async () => {
      mockDataSource.isInitialized = false;
      
      await expect(databaseService.query('SELECT 1')).rejects.toThrow('Database not connected');
    });
  });

  describe('Health Status', () => {
    it('should return health status when connected', async () => {
      mockDataSource.isInitialized = true;
      mockDataSource.query.mockResolvedValue([{ uptime: 3600 }]);
      
      const health = await databaseService.getHealthStatus();
      expect(health.connected).toBe(true);
      expect(health.database).toBe('testdb');
      expect(health.host).toBe('localhost');
      expect(health.port).toBe(5432);
      expect(health.type).toBe('postgres');
      expect(health.uptime).toBeDefined();
    });

    it('should return health status when not connected', async () => {
      mockDataSource.isInitialized = false;
      
      const health = await databaseService.getHealthStatus();
      expect(health.connected).toBe(false);
      expect(health.database).toBe('testdb');
      expect(health.host).toBe('localhost');
      expect(health.port).toBe(5432);
      expect(health.type).toBe('postgres');
    });
  });

  describe('Database Management', () => {
    it('should create database if it does not exist', async () => {
      const mockClient = {
        connect: jest.fn().mockResolvedValue(undefined),
        query: jest.fn()
          .mockResolvedValueOnce({ rowCount: 0 }) // Database doesn't exist
          .mockResolvedValueOnce(undefined), // CREATE DATABASE
        end: jest.fn().mockResolvedValue(undefined),
      };
      
      // Mock pg Client for this test
      jest.mocked(Client).mockImplementation(() => mockClient as any);
      
      await databaseService.createDatabase();
      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(mockClient.end).toHaveBeenCalled();
    });

    it('should not create database if it already exists', async () => {
      const mockClient = {
        connect: jest.fn().mockResolvedValue(undefined),
        query: jest.fn().mockResolvedValueOnce({ rowCount: 1 }), // Database exists
        end: jest.fn().mockResolvedValue(undefined),
      };
      
      // Mock pg Client for this test
      jest.mocked(Client).mockImplementation(() => mockClient as any);
      
      await databaseService.createDatabase();
      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.end).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      mockDataSource.initialize.mockRejectedValue(new Error('Connection failed'));
      
      await expect(databaseService.connect()).rejects.toThrow('Failed to connect to database');
    });

    it('should handle disconnection errors gracefully', async () => {
      mockDataSource.isInitialized = true;
      mockDataSource.destroy.mockRejectedValue(new Error('Disconnection failed'));
      
      await expect(databaseService.disconnect()).rejects.toThrow('Failed to disconnect from database');
    });

    it('should handle query errors gracefully', async () => {
      mockDataSource.isInitialized = true;
      mockDataSource.query.mockRejectedValue(new Error('Query failed'));
      
      await expect(databaseService.query('SELECT 1')).rejects.toThrow('Failed to execute query');
    });
  });
});