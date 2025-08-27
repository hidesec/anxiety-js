import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import { RouterEngine } from '../router/router-engine';

/**
 * Application configuration interface
 */
export interface ApplicationConfig {
  cors?: boolean;
  bodyParser?: boolean;
  globalPrefix?: string;
  port?: number;
}

/**
 * Application factory class for creating and configuring the Anxiety app
 */
export class AnxietyApplication {
  private app: Express;
  private routerEngine: RouterEngine;
  private config: ApplicationConfig;

  constructor(config: ApplicationConfig = {}) {
    this.app = express();
    this.routerEngine = new RouterEngine();
    this.config = {
      cors: true,
      bodyParser: true,
      port: 3000,
      ...config
    };

    this.setupMiddleware();
  }

  /**
   * Setup default middleware
   */
  private setupMiddleware(): void {
    if (this.config.bodyParser) {
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));
    }

    // Global route for health check
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Hello there! Welcome to Anxiety Framework',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Register a controller with the application
   * @param controllerClass - Controller class to register
   */
  registerController(controllerClass: any): void {
    this.routerEngine.registerController(controllerClass, this.config.globalPrefix);
  }

  /**
   * Register multiple controllers
   * @param controllers - Array of controller classes
   */
  registerControllers(controllers: any[]): void {
    controllers.forEach(controller => this.registerController(controller));
  }

  /**
   * Use global middleware
   * @param middleware - Middleware function
   */
  use(middleware: any): void {
    this.app.use(middleware);
  }

  /**
   * Set global prefix for all routes
   * @param prefix - Global prefix
   */
  setGlobalPrefix(prefix: string): void {
    this.config.globalPrefix = prefix;
  }

  /**
   * Setup error handling and 404 middleware
   */
  private setupErrorHandling(): void {
    // Error handling middleware
    this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      console.error('❌ Error occurred:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'Something went wrong!',
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Initialize the application (setup routes and error handling)
   */
  init(): void {
    this.app.use(this.routerEngine.getRouter());
    this.setupErrorHandling();
  }

  /**
   * Start the application server
   * @param port - Optional port number
   * @param callback - Optional callback function
   */
  listen(port?: number, callback?: () => void): void {
    const serverPort = port || this.config.port || 3000;
    
    this.app.listen(serverPort, () => {
      console.log(`🚀 Anxiety Framework is running on port ${serverPort}!`);
      console.log(`📱 Server URL: http://localhost:${serverPort}`);
      
      if (callback) {
        callback();
      }
    });
  }

  /**
   * Get the Express application instance
   * @returns Express application
   */
  getHttpAdapter(): Express {
    return this.app;
  }
}

/**
 * Factory function to create an Anxiety application
 * @param config - Application configuration
 * @returns AnxietyApplication instance
 */
export function createAnxietyApp(config?: ApplicationConfig): AnxietyApplication {
  return new AnxietyApplication(config);
}