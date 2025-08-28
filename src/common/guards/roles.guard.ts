import { GuardInterface } from './guard.interface';
import { AnxietyRequest, AnxietyResponse } from '../../middleware/interfaces/middleware.interface';

/**
 * Role-based Authorization Guard
 * Checks if the authenticated user has required roles
 */
export class RolesGuard implements GuardInterface {
  private requiredRoles: string[];

  constructor(roles: string[]) {
    this.requiredRoles = roles;
  }

  /**
   * Check if the user has the required roles
   */
  canActivate(req: AnxietyRequest, res: AnxietyResponse): boolean {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required',
        timestamp: new Date().toISOString()
      });
      return false;
    }

    const userRoles = user.roles || [];
    const hasRequiredRole = this.requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${this.requiredRoles.join(', ')}`,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // Add authorization info to context
    req.context = {
      ...req.context,
      authorized: true,
      authorizedRoles: this.requiredRoles,
      userRoles: userRoles
    };

    return true;
  }
}

/**
 * Factory function to create roles guard
 */
export function Roles(...roles: string[]) {
  return new RolesGuard(roles);
}