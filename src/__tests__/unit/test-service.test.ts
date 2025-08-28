import { TestService } from '../../modules/test/services/test.service';

describe('TestService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
  });

  describe('getAllTests', () => {
    it('should return all tests with query parameters', () => {
      // Arrange
      const query = { page: 1, limit: 10 };

      // Act
      const result = service.getAllTests(query) as any;

      // Assert
      expect(result).toHaveProperty('message', 'All tests retrieved');
      expect(result).toHaveProperty('query', query);
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should handle empty query parameters', () => {
      // Arrange
      const query = {};

      // Act
      const result = service.getAllTests(query) as any;

      // Assert
      expect(result).toHaveProperty('message', 'All tests retrieved');
      expect(result).toHaveProperty('query', {});
    });
  });

  describe('getTestById', () => {
    it('should return test by id with include and user agent', () => {
      // Arrange
      const id = '123';
      const include = 'details';
      const userAgent = 'Jest/Test';

      // Act
      const result = service.getTestById(id, include, userAgent);

      // Assert
      expect(result).toEqual({
        id: '123',
        include: 'details',
        userAgent: 'Jest/Test',
        message: 'Test retrieved successfully'
      });
    });

    it('should return test by id without optional parameters', () => {
      // Arrange
      const id = '456';

      // Act
      const result = service.getTestById(id);

      // Assert
      expect(result).toEqual({
        id: '456',
        include: undefined,
        userAgent: undefined,
        message: 'Test retrieved successfully'
      });
    });
  });

  describe('createTest', () => {
    it('should create a test with body and user context', () => {
      // Arrange
      const body = { name: 'New Test', description: 'Test description' };
      const user = { id: 1, name: 'John Doe' };
      const context = { requestId: 'req-123' };

      // Act
      const result = service.createTest(body, user, context);

      // Assert
      expect(result).toEqual({
        message: 'Test created successfully',
        data: body,
        user: user,
        context: context
      });
    });

    it('should create a test with only body', () => {
      // Arrange
      const body = { name: 'Simple Test' };

      // Act
      const result = service.createTest(body);

      // Assert
      expect(result).toEqual({
        message: 'Test created successfully',
        data: body,
        user: undefined,
        context: undefined
      });
    });
  });

  describe('updateTest', () => {
    it('should update test with id, body and user', () => {
      // Arrange
      const id = '789';
      const body = { name: 'Updated Test' };
      const user = { id: 1, name: 'Jane Doe' };

      // Act
      const result = service.updateTest(id, body, user);

      // Assert
      expect(result).toEqual({
        message: 'Test 789 updated successfully',
        data: body,
        user: user
      });
    });
  });

  describe('deleteTest', () => {
    it('should delete test by id', () => {
      // Arrange
      const id = '999';

      // Act
      const result = service.deleteTest(id) as any;

      // Assert
      expect(result).toHaveProperty('message', 'Test 999 deleted successfully');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('customEndpoint', () => {
    it('should return custom greeting with parameters', () => {
      // Arrange
      const name = 'World';
      const queryParams = { foo: 'bar', test: true };
      const context = { requestId: 'req-456' };

      // Act
      const result = service.customEndpoint(name, queryParams, context);

      // Assert
      expect(result).toEqual({
        greeting: 'Hello World! Welcome to Anxiety Framework',
        params: queryParams,
        context: context,
        timestamp: expect.any(String)
      });
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      // Act
      const result = service.healthCheck() as any;

      // Assert
      expect(result).toHaveProperty('status', 'OK');
      expect(result).toHaveProperty('service', 'Anxiety Framework');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});