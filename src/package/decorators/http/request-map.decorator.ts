import 'reflect-metadata';
import { RouteDefinition } from '../../interface/decorator/http-interface/RouteDefinition.interface';

const ROUTES_METADATA = 'routes';

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

export const Get = createMappingDecorator('get');
export const Post = createMappingDecorator('post');
export const Put = createMappingDecorator('put');
export const Delete = createMappingDecorator('delete');
export const Patch = createMappingDecorator('patch');
export const Options = createMappingDecorator('options');
export const Head = createMappingDecorator('head');

export { ROUTES_METADATA };