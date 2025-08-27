/**
 * Route definition interface for HTTP routes
 */
export interface RouteDefinition {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
  methodName: string;
  middlewares?: Function[];
}

/**
 * Middleware definition interface
 */
export interface MiddlewareDefinition {
  target: Function;
  middlewares: Function[];
}