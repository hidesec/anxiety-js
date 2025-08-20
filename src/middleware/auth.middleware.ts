import { MiddlewareInterface, AnxietyRequest, AnxietyResponse, NextHandler } from '../package/interface/middleware/middleware.interface';

export class AuthMiddleware implements MiddlewareInterface {
  async use(req: AnxietyRequest, res: AnxietyResponse, next: NextHandler): Promise<void> {
    console.log('AuthMiddleware: Checking authentication...');
    
    const token = req.headers.authorization;
    
    if (!token) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
      return;
    }

    // test validasi token
    if (token === 'Bearer invalid-token') {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid token' 
      });
      return;
    }

    // Set user data
    req.user = { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com' 
    };
    
    req.context = { 
      ...req.context, 
      authenticated: true,
      timestamp: new Date().toISOString()
    };
    
    console.log('AuthMiddleware: Authentication successful');
    next();
  }
}