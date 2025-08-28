import { JwtAuthGuard, Roles, RolesGuard } from '../../common/guards';
import { AnxietyRequest, AnxietyResponse } from '../../middleware/interfaces/middleware.interface';

describe('Guards', () => {
  let mockReq: Partial<AnxietyRequest>;
  let mockRes: Partial<AnxietyResponse>;
  let statusSpy: jest.SpyInstance;
  let jsonSpy: jest.SpyInstance;

  beforeEach(() => {
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
    
    mockReq = {
      headers: {},
      context: {}
    };
    
    mockRes = {
      status: statusSpy as any,
      json: jsonSpy as any
    };
  });

  describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(() => {
      guard = new JwtAuthGuard();
    });

    it('should reject requests without authorization header', () => {
      const result = guard.canActivate(mockReq as AnxietyRequest, mockRes as AnxietyResponse);
      
      expect(result).toBe(false);
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'JWT token is required',
        timestamp: expect.any(String)
      });
    });

    it('should reject invalid tokens', () => {
      mockReq.headers!.authorization = 'Bearer invalid-token';
      
      const result = guard.canActivate(mockReq as AnxietyRequest, mockRes as AnxietyResponse);
      
      expect(result).toBe(false);
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid JWT token',
        timestamp: expect.any(String)
      });
    });

    it('should accept valid tokens', () => {
      mockReq.headers!.authorization = 'Bearer valid-jwt-token-here';
      
      const result = guard.canActivate(mockReq as AnxietyRequest, mockRes as AnxietyResponse);
      
      expect(result).toBe(true);
      expect(mockReq.user).toBeDefined();
      expect(mockReq.context?.authenticated).toBe(true);
      expect(mockReq.context?.authMethod).toBe('jwt');
    });

    it('should handle bearer token extraction', () => {
      mockReq.headers!.authorization = 'valid-jwt-token-without-bearer';
      
      const result = guard.canActivate(mockReq as AnxietyRequest, mockRes as AnxietyResponse);
      
      expect(result).toBe(true);
    });
  });

  describe('RolesGuard', () => {
    let guard: RolesGuard;

    beforeEach(() => {
      guard = new RolesGuard(['admin', 'moderator']);
    });

    it('should reject requests without user', () => {
      const result = guard.canActivate(mockReq as AnxietyRequest, mockRes as AnxietyResponse);
      
      expect(result).toBe(false);
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'User authentication required',
        timestamp: expect.any(String)
      });
    });

    it('should reject users without required roles', () => {
      mockReq.user = { id: 1, roles: ['user'] };
      
      const result = guard.canActivate(mockReq as AnxietyRequest, mockRes as AnxietyResponse);
      
      expect(result).toBe(false);
      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Access denied. Required roles: admin, moderator',
        timestamp: expect.any(String)
      });
    });

    it('should accept users with required roles', () => {
      mockReq.user = { id: 1, roles: ['admin', 'user'] };
      
      const result = guard.canActivate(mockReq as AnxietyRequest, mockRes as AnxietyResponse);
      
      expect(result).toBe(true);
      expect(mockReq.context?.authorized).toBe(true);
      expect(mockReq.context?.authorizedRoles).toEqual(['admin', 'moderator']);
      expect(mockReq.context?.userRoles).toEqual(['admin', 'user']);
    });

    it('should handle users without roles array', () => {
      mockReq.user = { id: 1 };
      
      const result = guard.canActivate(mockReq as AnxietyRequest, mockRes as AnxietyResponse);
      
      expect(result).toBe(false);
    });
  });

  describe('Roles factory function', () => {
    it('should create RolesGuard with specified roles', () => {
      const guard = Roles('admin', 'editor');
      
      expect(guard).toBeInstanceOf(RolesGuard);
    });
  });
});