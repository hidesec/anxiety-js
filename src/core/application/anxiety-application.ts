import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import { RouterEngine } from '../router/router-engine';
import { ConfigService, ConfigModule, ConfigModuleOptions } from '../../config';
import { DatabaseService, DatabaseModule, DatabaseModuleOptions } from '../../database';

/**
 * Application configuration interface
 */
export type ApplicationConfig = {
  cors?: boolean;
  bodyParser?: boolean;
  globalPrefix?: string;
  port?: number;
  config?: ConfigModuleOptions;
  database?: DatabaseModuleOptions;
}

/**
 * Application factory class for creating and configuring the Anxiety app
 */
export class AnxietyApplication {
  private app: Express;
  private routerEngine: RouterEngine;
  private config: ApplicationConfig;
  private configService: ConfigService;
  private databaseService: DatabaseService | null = null;

  constructor(config: ApplicationConfig = {}) {
    this.app = express();
    this.routerEngine = new RouterEngine();
    this.config = {
      cors: true,
      bodyParser: true,
      port: 3000,
      ...config
    };

    // Initialize ConfigService
    this.configService = ConfigModule.initialize(this.config.config);
    
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
        version: this.configService.get('app.version', '1.0.0'),
        environment: this.configService.get('app.environment', 'development'),
        timestamp: new Date().toISOString()
      });
    });

    // Health check endpoint
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const dbHealth = this.databaseService
          ? await this.databaseService.getHealthStatus()
          : { connected: false, message: 'Database not initialized' };

        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: this.configService.get('app.environment'),
          version: this.configService.get('app.version'),
          database: dbHealth
        });
      } catch (error: any) {
        res.status(503).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          error: error?.message || 'Unknown error'
        });
      }
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
   * Initialize database connection
   */
  private async initDatabase(): Promise<void> {
    try {
      this.databaseService = await DatabaseModule.initialize(this.configService, this.config.database);
      if (process.env.NODE_ENV !== 'test') {
        console.log('🗄️  Database service initialized');
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize database:', error?.message);
      throw error;
    }
  }

  /**
   * Initialize the application (setup routes and error handling)
   */
  async init(): Promise<void> {
    // Initialize database if configured
    if (this.config.database !== undefined && this.config.database !== null) {
      await this.initDatabase();
    }

    this.app.use(this.routerEngine.getRouter());
    this.setupErrorHandling();
  }

  /**
   * Start the application server
   * @param port - Optional port number
   * @param callback - Optional callback function
   */
  async listen(port?: number, callback?: () => void): Promise<void> {
    const serverPort = port || this.configService.get('app.port', this.config.port || 3000);
    
    // Initialize the application
    await this.init();
    
    this.app.listen(serverPort, () => {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`🚀 Anxiety Framework is running on port ${serverPort}!`);
        console.log(`📱 Server URL: http://localhost:${serverPort}`);
        console.log(`🌍 Environment: ${this.configService.get('app.environment')}`);
        
        if (this.databaseService?.isConnected()) {
          console.log(`🗄️  Database: Connected to ${this.configService.get('database.database')}`);
        }
      }
      
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

  /**
   * Shutdown the application gracefully
   */
  async shutdown(): Promise<void> {
    if (this.databaseService) {
      await this.databaseService.disconnect();
      if (process.env.NODE_ENV !== 'test') {
        console.log('🔌 Database disconnected');
      }
    }
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('👋 Anxiety Framework shut down gracefully');
    }
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