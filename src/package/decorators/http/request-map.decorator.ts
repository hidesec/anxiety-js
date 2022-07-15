import {RouteDefinitionInterface} from '../../interface/decorator/http-interface/RouteDefinition.interface';

export const Get = (path: string): MethodDecorator =>{

  return (target, propertyKey: string | symbol): void => {
    if (!Reflect.hasOwnMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinitionInterface>;

    routes.push({
      requestMethod: 'get',
      path,
      methodName: propertyKey,
    });

    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};
