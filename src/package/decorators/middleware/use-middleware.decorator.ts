import 'reflect-metadata';

const MIDDLEWARE_METADATA = 'anxiety_middleware';

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

export { MIDDLEWARE_METADATA };