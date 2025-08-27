import 'reflect-metadata';

export const MIDDLEWARE_METADATA = 'anxiety_middleware';

/**
 * UseMiddleware decorator for applying middleware to controllers or methods
 * @param middlewares - Middleware classes to apply
 */
export function UseMiddleware(...middlewares: Function[]): ClassDecorator & MethodDecorator {
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey) {
      // Method-level middleware
      const existingMiddlewares = Reflect.getMetadata(MIDDLEWARE_METADATA, target, propertyKey) || [];
      Reflect.defineMetadata(MIDDLEWARE_METADATA, [...existingMiddlewares, ...middlewares], target, propertyKey);
    } else {
      // Class-level middleware
      const existingMiddlewares = Reflect.getMetadata(MIDDLEWARE_METADATA, target) || [];
      Reflect.defineMetadata(MIDDLEWARE_METADATA, [...existingMiddlewares, ...middlewares], target);
    }
  };
}