import express from 'express';
import request from 'supertest';
import 'reflect-metadata';
import { RouterEngine } from '../../core/router/router-engine';
import { Controller } from '../../core/decorators/controller.decorator';
import { Get, Post } from '../../http/decorators/request-mapping.decorator';
import { Param, Query, Body } from '../../http/decorators/route-params.decorator';

// Test controller for integration testing
@Controller('/integration')
class IntegrationTestController {
  @Get('/static')
  staticRoute() {
    return { route: 'static', message: 'Static route works' };
  }

  @Get('/dynamic/:id')
  dynamicRoute(@Param('id') id: string) {
    return { route: 'dynamic', id, message: 'Dynamic route works' };
  }

  @Get('/query')
  queryRoute(@Query('search') search: string) {
    return { route: 'query', search, message: 'Query route works' };
  }

  @Post('/body')
  bodyRoute(@Body() body: any) {
    return { route: 'body', data: body, message: 'Body route works' };
  }

  @Get('/multiple/:category/:id')
  multipleParams(
    @Param('category') category: string,
    @Param('id') id: string,
    @Query('include') include?: string
  ) {
    return {
      route: 'multiple',
      category,
      id,
      include,
      message: 'Multiple params route works'
    };
  }
}

describe('Router Engine Integration Tests', () => {
  let app: express.Express;
  let routerEngine: RouterEngine;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    routerEngine = new RouterEngine();
    routerEngine.registerController(IntegrationTestController);
    app.use(routerEngine.getRouter());
  });

  afterEach(async () => {
    // Clean up any open handles
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  describe('Route Registration', () => {
    it('should handle static routes', async () => {
      const response = await request(app).get('/integration/static');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        route: 'static',
        message: 'Static route works'
      });
    });

    it('should handle dynamic routes with parameters', async () => {
      const response = await request(app).get('/integration/dynamic/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        route: 'dynamic',
        id: '123',
        message: 'Dynamic route works'
      });
    });

    it('should handle query parameters', async () => {
      const response = await request(app).get('/integration/query?search=test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        route: 'query',
        search: 'test',
        message: 'Query route works'
      });
    });

    it('should handle request body', async () => {
      const testData = { name: 'Test', value: 42 };
      const response = await request(app)
        .post('/integration/body')
        .send(testData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        route: 'body',
        data: testData,
        message: 'Body route works'
      });
    });

    it('should handle multiple parameters and query', async () => {
      const response = await request(app)
        .get('/integration/multiple/books/456?include=author');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        route: 'multiple',
        category: 'books',
        id: '456',
        include: 'author',
        message: 'Multiple params route works'
      });
    });
  });

  describe('Route Priority', () => {
    it('should prioritize static routes over dynamic routes', async () => {
      // This test ensures that /integration/static is matched before /integration/:id
      const response = await request(app).get('/integration/static');

      expect(response.status).toBe(200);
      expect(response.body.route).toBe('static');
      // Should not be treated as dynamic route with id="static"
      expect(response.body.id).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/integration/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/integration/body')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });
});