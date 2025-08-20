import 'reflect-metadata';

const ROUTE_PARAM_METADATA = 'route_param_metadata';

export interface ParamMetadata {
  index: number;
  type: 'param' | 'query' | 'body' | 'headers' | 'request' | 'response';
  key?: string;
}

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

export { ROUTE_PARAM_METADATA };