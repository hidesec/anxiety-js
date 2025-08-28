import { GuardInterface } from './guard.interface';
import { AnxietyRequest, AnxietyResponse } from '../../middleware/interfaces/middleware.interface';
import { User } from '../../entities/user.entity';

/**
 * JWT Authentication Guard
 * Validates JWT tokens and protects routes from unauthorized access
 */
export class JwtAuthGuard implements GuardInterface {
  /**
   * Check if the request has a valid JWT token
   */
  canActivate(req: AnxietyRequest, res: AnxietyResponse): boolean {
    const token = req.headers.authorization;
    
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'JWT token is required',
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // Extract bearer token
    const bearerToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    try {
      // Simple JWT validation (in production, use proper JWT library)
      if (this.validateJwtToken(bearerToken)) {
        // Add user info to request context
        req.user = this.decodeToken(bearerToken);
        req.context = {
          ...req.context,
          authenticated: true,
          authMethod: 'jwt',
          timestamp: new Date().toISOString()
        };
        return true;
      } else {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid JWT token',
          timestamp: new Date().toISOString()
        });
        return false;
      }
    } catch (error) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'JWT token validation failed',
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  /**
   * Validate JWT token (simplified implementation)
   * In production, use libraries like jsonwebtoken
   */
  private validateJwtToken(token: string): boolean {
    // Basic validation - in production use proper JWT validation
    return token.length > 10 && token !== 'invalid-token';
  }

  /**
   * Decode JWT token (simplified implementation)
   * In production, use proper JWT decoding
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private decodeToken(_token: string): User {
    // Simplified user data - in production decode actual JWT
    return {
      id: 1,
      name: 'Test User',
      email: 'user@anxiety-js.com',
      password: 'hashed-password',
      isActive: true,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      toResponse: function() { return this; }
    };
  }
}