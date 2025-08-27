import 'reflect-metadata';

export const ROUTE_PARAM_METADATA = 'route_param_metadata';

export interface ParamMetadata {
  index: number;
  type: 'param' | 'query' | 'body' | 'headers' | 'request' | 'response';
  key?: string;
}

/**
 * Route parameter decorator for extracting URL parameters
 * @param key - Optional parameter key
 */
export function Param(key?: string): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(ROUTE_PARAM_METADATA, target, propertyKey!) || [];
    existingParams.push({
      index: parameterIndex,
      type: 'param',
      key
    });
    Reflect.defineMetadata(ROUTE_PARAM_METADATA, existingParams, target, propertyKey!);
  };
}

/**
 * Query parameter decorator for extracting query string parameters
 * @param key - Optional query parameter key
 */
export function Query(key?: string): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(ROUTE_PARAM_METADATA, target, propertyKey!) || [];
    existingParams.push({
      index: parameterIndex,
      type: 'query',
      key
    });
    Reflect.defineMetadata(ROUTE_PARAM_METADATA, existingParams, target, propertyKey!);
  };
}

/**
 * Request body decorator for extracting the request body
 */
export function Body(): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(ROUTE_PARAM_METADATA, target, propertyKey!) || [];
    existingParams.push({
      index: parameterIndex,
      type: 'body'
    });
    Reflect.defineMetadata(ROUTE_PARAM_METADATA, existingParams, target, propertyKey!);
  };
}

/**
 * Request object decorator for injecting the full request object
 */
export function Req(): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(ROUTE_PARAM_METADATA, target, propertyKey!) || [];
    existingParams.push({
      index: parameterIndex,
      type: 'request'
    });
    Reflect.defineMetadata(ROUTE_PARAM_METADATA, existingParams, target, propertyKey!);
  };
}

/**
 * Response object decorator for injecting the response object
 */
export function Res(): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(ROUTE_PARAM_METADATA, target, propertyKey!) || [];
    existingParams.push({
      index: parameterIndex,
      type: 'response'
    });
    Reflect.defineMetadata(ROUTE_PARAM_METADATA, existingParams, target, propertyKey!);
  };
}

/**
 * Headers decorator for extracting HTTP headers
 * @param key - Optional header key
 */
export function Headers(key?: string): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(ROUTE_PARAM_METADATA, target, propertyKey!) || [];
    existingParams.push({
      index: parameterIndex,
      type: 'headers',
      key
    });
    Reflect.defineMetadata(ROUTE_PARAM_METADATA, existingParams, target, propertyKey!);
  };
}