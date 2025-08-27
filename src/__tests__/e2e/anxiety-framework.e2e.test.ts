import express from 'express';
import request from 'supertest';
import 'reflect-metadata';
import { RouterEngine } from '../../core/router/router-engine';
import { TestController } from '../../modules/test/controllers/test.controller';

describe('Anxiety Framework Integration', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const routerEngine = new RouterEngine();
    routerEngine.registerController(TestController);

    app.use(routerEngine.getRouter());
  });

  afterAll(async () => {
    // Comprehensive cleanup to prevent worker process leaks
    
    // Clear all timers
    jest.clearAllTimers();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Remove all listeners
    process.removeAllListeners('uncaughtException');
    process.removeAllListeners('unhandledRejection');
    
    // Add longer delay to allow proper cleanup
    await new Promise(resolve => setTimeout(resolve, 200));
  });

  it('GET /api/test/health should return health status', async () => {
    const res = await request(app).get('/api/test/health').set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.service).toBe('Anxiety Framework');
  });

  it('GET /api/test should return all tests', async () => {
    const res = await request(app).get('/api/test');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('All tests retrieved');
  });

  it('GET /api/test/123 with Auth should return test by id', async () => {
    const res = await request(app)
      .get('/api/test/123?include=details')
      .set('Authorization', 'Bearer valid-token')
      .set('User-Agent', 'JestTest');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('123');
    expect(res.body.include).toBe('details');
    expect(res.body.userAgent).toBe('JestTest');
  });

  it('GET /api/test/123 without Auth should return 401', async () => {
    const res = await request(app).get('/api/test/123');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('POST /api/test with Auth should create test', async () => {
    const res = await request(app)
      .post('/api/test')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'UnitTest' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Test created successfully');
    expect(res.body.data.name).toBe('UnitTest');
    expect(res.body.user).toBeDefined();
  });

  it('PUT /api/test/456 with Auth should update test', async () => {
    const res = await request(app)
      .put('/api/test/456')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'UpdatedTest' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Test 456 updated successfully');
    expect(res.body.data.name).toBe('UpdatedTest');
  });

  it('DELETE /api/test/789 with Auth should delete test', async () => {
    const res = await request(app)
      .delete('/api/test/789')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Test 789 deleted successfully');
  });

  it('GET /api/test/custom/hello should return custom greeting', async () => {
    const res = await request(app).get('/api/test/custom/hello?foo=bar');
    expect(res.status).toBe(200);
    expect(res.body.greeting).toContain('Hello hello!');
    expect(res.body.params.foo).toBe('bar');
    expect(res.body.timestamp).toBeDefined();
  });
});