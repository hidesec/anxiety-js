import 'reflect-metadata';
import { RouterEngine } from '../../core/router/router-engine';
import { Controller } from '../../core/decorators/controller.decorator';
import { Get, Post } from '../../http/decorators/request-mapping.decorator';
import { Param, Query } from '../../http/decorators/route-params.decorator';

// Mock controller for testing
@Controller('/test')
class MockController {
  @Get('/health')
  health() {
    return { status: 'OK' };
  }

  @Get('/:id')
  getById(@Param('id') id: string, @Query('include') include?: string) {
    return { id, include };
  }

  @Post()
  create() {
    return { created: true };
  }
}

describe('RouterEngine Unit Tests', () => {
  let routerEngine: RouterEngine;

  beforeEach(() => {
    routerEngine = new RouterEngine();
  });

  describe('Constructor', () => {
    it('should create a router engine instance', () => {
      expect(routerEngine).toBeDefined();
      expect(routerEngine.getRouter).toBeDefined();
    });

    it('should return an Express router', () => {
      const router = routerEngine.getRouter();
      expect(router).toBeDefined();
      expect(typeof router).toBe('function');
    });
  });

  describe('registerController', () => {
    it('should register controller without errors', () => {
      expect(() => {
        routerEngine.registerController(MockController);
      }).not.toThrow();
    });

    it('should register controller with base path', () => {
      expect(() => {
        routerEngine.registerController(MockController, '/v1');
      }).not.toThrow();
    });

    it('should handle controller without routes', () => {
      class EmptyController {}
      
      expect(() => {
        routerEngine.registerController(EmptyController);
      }).not.toThrow();
    });
  });

  describe('getRouter', () => {
    it('should return the same router instance', () => {
      const router1 = routerEngine.getRouter();
      const router2 = routerEngine.getRouter();
      expect(router1).toBe(router2);
    });
  });
});