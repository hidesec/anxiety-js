import 'reflect-metadata';
import { RouteDefinition } from '../interfaces/route-definition.interface';

export const ROUTES_METADATA = 'routes';

/**
 * Creates a mapping decorator for HTTP methods
 * @param method - HTTP method type
 */
function createMappingDecorator(method: RouteDefinition['method']) {
  return (path: string = ''): MethodDecorator => {
    return (target: any, propertyKey: string | symbol) => {
      const existingRoutes: RouteDefinition[] = Reflect.getMetadata(ROUTES_METADATA, target.constructor) || [];
      
      existingRoutes.push({
        path,
        method,
        methodName: propertyKey.toString()
      });
      
      Reflect.defineMetadata(ROUTES_METADATA, existingRoutes, target.constructor);
    };
  };
}

/**
 * GET method decorator
 * @param path - Route path
 */
export const Get = createMappingDecorator('get');

/**
 * POST method decorator
 * @param path - Route path
 */
export const Post = createMappingDecorator('post');

/**
 * PUT method decorator
 * @param path - Route path
 */
export const Put = createMappingDecorator('put');

/**
 * DELETE method decorator
 * @param path - Route path
 */
export const Delete = createMappingDecorator('delete');

/**
 * PATCH method decorator
 * @param path - Route path
 */
export const Patch = createMappingDecorator('patch');

/**
 * OPTIONS method decorator
 * @param path - Route path
 */
export const Options = createMappingDecorator('options');

/**
 * HEAD method decorator
 * @param path - Route path
 */
export const Head = createMappingDecorator('head');