import { Router, NextFunction, Request, Response } from 'express';
import 'reflect-metadata';
import { RouteDefinition } from '../../http/interfaces/route-definition.interface';
import { AnxietyRequest, AnxietyResponse } from '../../middleware/interfaces/middleware.interface';
import { ROUTES_METADATA } from '../../http/decorators/request-mapping.decorator';
import { MIDDLEWARE_METADATA } from '../../middleware/decorators/use-middleware.decorator';
import { ROUTE_PARAM_METADATA, ParamMetadata } from '../../http/decorators/route-params.decorator';

/**
 * Router engine responsible for registering controllers and their routes
 */
export class RouterEngine {
  private router = Router();

  /**
   * Register a controller with the router engine
   * @param controllerClass - Controller class to register
   * @param basePath - Optional base path for all routes
   */
  registerController(controllerClass: any, basePath = ''): void {
    const controllerInstance = new controllerClass();
    const routes: RouteDefinition[] = Reflect.getMetadata(ROUTES_METADATA, controllerClass) || [];
    const classMiddlewares: (new (...args: unknown[]) => object)[] = Reflect.getMetadata(MIDDLEWARE_METADATA, controllerClass) || [];
    const controllerPrefix: string = Reflect.getMetadata('controller_prefix', controllerClass) || '';

    // Sort routes: static routes first, then dynamic routes
    routes.sort((a, b) => {
      const aIsDynamic = a.path.includes(':');
      const bIsDynamic = b.path.includes(':');
      if (aIsDynamic === bIsDynamic) return 0;
      return aIsDynamic ? 1 : -1;
    });

    routes.forEach(route => {
      const fullPath = this.combinePaths(basePath, controllerPrefix, route.path);
      const methodMiddlewares: (new (...args: unknown[]) => object)[] = Reflect.getMetadata(MIDDLEWARE_METADATA, controllerClass.prototype, route.methodName) || [];
      const allMiddlewares = [...classMiddlewares, ...methodMiddlewares];

      // Convert middleware functions to Express middleware
      const expressMiddlewares = allMiddlewares.map(middleware => this.createExpressMiddleware(middleware));

      const handler = this.createRouteHandler(controllerInstance, route.methodName);

      // Only log route registration in non-test environments
      if (process.env.NODE_ENV !== 'test') {
        console.log(`🛣️  Registering route: ${route.method.toUpperCase()} ${fullPath}`);
      }
      // Cast handlers to Express-compatible types
      this.router[route.method](fullPath, ...expressMiddlewares as any[], handler as any);
    });
  }

  /**
   * Combine multiple path segments into a single path
   * @param paths - Path segments to combine
   * @returns Combined path
   */
  private combinePaths(...paths: string[]): string {
    const cleanPaths = paths
      .filter(path => path && path.trim() !== '')
      .map(path => path.replace(/^\/|\/$/g, ''));
    
    const result = '/' + cleanPaths.join('/');
    return result === '/' ? '/' : result.replace(/\/$/, '');
  }

  /**
   * Create Express middleware from Anxiety middleware class
   * @param middlewareClass - Middleware class
   * @returns Express middleware function
   */
  private createExpressMiddleware(middlewareClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const middlewareInstance = new middlewareClass();
        if (middlewareInstance.use) {
          await middlewareInstance.use(req as AnxietyRequest, res as AnxietyResponse, next);
        } else {
          next();
        }
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Create route handler with parameter injection
   * @param controllerInstance - Controller instance
   * @param methodName - Method name to call
   * @returns Route handler function
   */
  private createRouteHandler(controllerInstance: any, methodName: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const paramMetadata: ParamMetadata[] = Reflect.getMetadata(
          ROUTE_PARAM_METADATA,
          controllerInstance.constructor.prototype,
          methodName
        ) || [];

        const args = this.extractMethodArguments(req as AnxietyRequest, res as AnxietyResponse, paramMetadata);
        const result = await controllerInstance[methodName](...args);

        if (!res.headersSent && result !== undefined) {
          res.json(result);
        }
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Extract method arguments from request based on parameter metadata
   * @param req - Request object
   * @param res - Response object
   * @param paramMetadata - Parameter metadata
   * @returns Array of arguments for method call
   */
  private extractMethodArguments(req: AnxietyRequest, res: AnxietyResponse, paramMetadata: ParamMetadata[]): any[] {
    const args: any[] = [];

    paramMetadata
      .sort((a, b) => a.index - b.index)
      .forEach(param => {
        switch (param.type) {
          case 'param':
            args[param.index] = param.key ? req.params[param.key] : req.params;
            break;
          case 'query':
            args[param.index] = param.key ? req.query[param.key] : req.query;
            break;
          case 'body':
            args[param.index] = req.body;
            break;
          case 'headers':
            args[param.index] = param.key ? req.headers[param.key] : req.headers;
            break;
          case 'request':
            args[param.index] = req;
            break;
          case 'response':
            args[param.index] = res;
            break;
          default:
            args[param.index] = undefined;
        }
      });

    return args;
  }

  /**
   * Get the Express router instance
   * @returns Express Router
   */
  getRouter(): Router {
    return this.router;
  }
}