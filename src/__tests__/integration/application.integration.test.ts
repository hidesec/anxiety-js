import 'reflect-metadata';
import { createAnxietyApp, AnxietyApplication } from '../../core/application/anxiety-application';

describe('Application Integration Tests', () => {
  let app: AnxietyApplication;

  afterEach(() => {
    // Clean up any running servers
    if (app) {
      // Note: In a real scenario, you'd want to properly close the server
      // For testing purposes, we're just ensuring the app is created properly
    }
  });

  describe('createAnxietyApp', () => {
    it('should create application with default config', () => {
      app = createAnxietyApp();
      expect(app).toBeDefined();
      expect(app.getHttpAdapter).toBeDefined();
    });

    it('should create application with custom config', () => {
      app = createAnxietyApp({
        port: 4000,
        bodyParser: false,
        cors: false
      });
      expect(app).toBeDefined();
    });

    it('should have HTTP adapter', () => {
      app = createAnxietyApp();
      const httpAdapter = app.getHttpAdapter();
      expect(httpAdapter).toBeDefined();
      expect(typeof httpAdapter).toBe('function');
    });
  });

  describe('Application methods', () => {
    beforeEach(() => {
      app = createAnxietyApp();
    });

    it('should register controllers', () => {
      class TestController {}
      
      expect(() => {
        app.registerController(TestController);
      }).not.toThrow();
    });

    it('should register multiple controllers', () => {
      class Controller1 {}
      class Controller2 {}
      
      expect(() => {
        app.registerControllers([Controller1, Controller2]);
      }).not.toThrow();
    });

    it('should set global prefix', () => {
      expect(() => {
        app.setGlobalPrefix('/api/v1');
      }).not.toThrow();
    });

    it('should initialize application', () => {
      expect(() => {
        app.init();
      }).not.toThrow();
    });
  });
});