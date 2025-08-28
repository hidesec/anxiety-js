import express from 'express';
import request from 'supertest';
import 'reflect-metadata';
import { RouterEngine } from '../../core/router/router-engine';
import { TestController } from '../../modules/test/controllers/test.controller';
import { AuthMiddleware } from '../../middleware/built-in/auth.middleware';
import { LoggingMiddleware } from '../../middleware/built-in/logging.middleware';

describe('Middleware Integration Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    const routerEngine = new RouterEngine();
    routerEngine.registerController(TestController);
    app.use(routerEngine.getRouter());
  });

  afterEach(async () => {
    // Comprehensive cleanup after each test
    jest.clearAllTimers();
    jest.clearAllMocks();
    
    // Clean up any open handles
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  
  afterAll(async () => {
    // Final cleanup to prevent worker process leaks
    jest.clearAllTimers();
    jest.clearAllMocks();
    
    // Remove all listeners
    process.removeAllListeners('uncaughtException');
    process.removeAllListeners('unhandledRejection');
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Add delay for cleanup
    await new Promise(resolve => setTimeout(resolve, 200));
  });

  describe('Authentication Middleware', () => {
    it('should allow requests with valid authorization', async () => {
      const response = await request(app)
        .get('/api/test/123')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('123');
    });

    it('should reject requests without authorization', async () => {
      const response = await request(app).get('/api/test/123');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('No token provided');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/test/123')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('Logging Middleware', () => {
    let consoleSpy: jest.SpyInstance;
    let originalNodeEnv: string | undefined;

    beforeEach(() => {
      // Temporarily set NODE_ENV to development to enable logging
      originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
      consoleSpy.mockRestore();
    });

    it('should log request and response information', async () => {
      await request(app).get('/api/test');

      // Check that logging middleware was called
      expect(consoleSpy).toHaveBeenCalled();
      
      // Check for request start log
      const startLogCall = consoleSpy.mock.calls.find(call =>
        call[0].includes('GET') && call[0].includes('/api/test') && call[0].includes('Start')
      );
      expect(startLogCall).toBeDefined();
    });

    it('should log request body for POST requests', async () => {
      const testData = { name: 'Integration Test' };

      await request(app)
        .post('/api/test')
        .set('Authorization', 'Bearer valid-token')
        .send(testData);

      // Check that body was logged
      const bodyLogCall = consoleSpy.mock.calls.find(call =>
        call[0].includes('Body:')
      );
      expect(bodyLogCall).toBeDefined();
    });
  });

  describe('Middleware Execution Order', () => {
    it('should execute middleware in correct order (Logging -> Auth)', async () => {
      // Temporarily enable logging for this test
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app)
        .get('/api/test/123')
        .set('Authorization', 'Bearer valid-token');

      const logs = consoleSpy.mock.calls.map(call => call[0]);
      
      // Find logging and auth middleware logs
      const loggingStartIndex = logs.findIndex(log => 
        typeof log === 'string' && log.includes('Start')
      );
      const authIndex = logs.findIndex(log => 
        typeof log === 'string' && log.includes('AuthMiddleware: Checking authentication')
      );

      expect(loggingStartIndex).toBeGreaterThanOrEqual(0);
      expect(authIndex).toBeGreaterThan(loggingStartIndex);

      // Restore environment and spy
      process.env.NODE_ENV = originalNodeEnv;
      consoleSpy.mockRestore();
    });
  });
});