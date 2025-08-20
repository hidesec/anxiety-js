import { Router, Request, Response, NextFunction } from 'express';
import 'reflect-metadata';
import { RouteDefinition } from '../../package/interface/decorator/http-interface/RouteDefinition.interface';
import { AnxietyRequest, AnxietyResponse } from '../../package/interface/middleware/middleware.interface';
import { ROUTES_METADATA } from '../../package/decorators/http/request-map.decorator';
import { MIDDLEWARE_METADATA } from '../../package/decorators/middleware/use-middleware.decorator';
import { ROUTE_PARAM_METADATA, ParamMetadata } from '../../package/decorators/http/route-param.decorator';

export class RouterEngine {
  private router = Router();

  registerController(controllerClass: any, basePath: string = ''): void {
    const controllerInstance = new controllerClass();
    const routes: RouteDefinition[] = Reflect.getMetadata(ROUTES_METADATA, controllerClass) || [];
    const classMiddlewares: Function[] = Reflect.getMetadata(MIDDLEWARE_METADATA, controllerClass) || [];
    const controllerPrefix: string = Reflect.getMetadata('controller_prefix', controllerClass) || '';

    // Sort: static routes first, then dynamic
    routes.sort((a, b) => {
      const aIsDynamic = a.path.includes(':');
      const bIsDynamic = b.path.includes(':');
      if (aIsDynamic === bIsDynamic) return 0;
      return aIsDynamic ? 1 : -1;
    });

    routes.forEach(route => {
      const fullPath = this.combinePaths(basePath, controllerPrefix, route.path);
      const methodMiddlewares: Function[] = Reflect.getMetadata(MIDDLEWARE_METADATA, controllerClass.prototype, route.methodName) || [];
      const allMiddlewares = [...classMiddlewares, ...methodMiddlewares];

      // Convert middleware functions to Express middleware
      const expressMiddlewares = allMiddlewares.map(middleware => this.createExpressMiddleware(middleware));

      const handler = this.createRouteHandler(controllerInstance, route.methodName);

      console.log(`Registering route: ${route.method.toUpperCase()} ${fullPath}`);
      this.router[route.method](fullPath, ...expressMiddlewares, handler);
    });
  }

  private combinePaths(...paths: string[]): string {
    const cleanPaths = paths
      .filter(path => path && path.trim() !== '')
      .map(path => path.replace(/^\/|\/$/g, ''));
    
    const result = '/' + cleanPaths.join('/');
    return result === '/' ? '/' : result.replace(/\/$/, '');
  }

  private createExpressMiddleware(middlewareClass: any) {
    return async (req: AnxietyRequest, res: AnxietyResponse, next: NextFunction) => {
      try {
        const middlewareInstance = new middlewareClass();
        if (middlewareInstance.use) {
          await middlewareInstance.use(req, res, next);
        } else {
          next();
        }
      } catch (error) {
        next(error);
      }
    };
  }

  private createRouteHandler(controllerInstance: any, methodName: string) {
    return async (req: AnxietyRequest, res: AnxietyResponse, next: NextFunction) => {
      try {
        const paramMetadata: ParamMetadata[] = Reflect.getMetadata(
          ROUTE_PARAM_METADATA,
          controllerInstance.constructor.prototype,
          methodName
        ) || [];

        const args = this.extractMethodArguments(req, res, paramMetadata);
        const result = await controllerInstance[methodName](...args);

        if (!res.headersSent && result !== undefined) {
          res.json(result);
        }
      } catch (error) {
        next(error);
      }
    };
  }

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

  getRouter(): Router {
    return this.router;
  }
}