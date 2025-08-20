export interface RouteDefinition {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
  methodName: string;
  middlewares?: Function[];
}

export interface MiddlewareDefinition {
  target: Function;
  middlewares: Function[];
}