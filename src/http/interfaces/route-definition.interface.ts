/**
 * Route definition interface for HTTP routes
 */
export type RouteDefinition = {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
  methodName: string;
  middlewares?: ((req: unknown, res: unknown, next: unknown) => void | Promise<void>)[];
}

/**
 * Middleware definition interface
 */
export type MiddlewareDefinition = {
  target: new (...args: unknown[]) => object;
  middlewares: ((req: unknown, res: unknown, next: unknown) => void | Promise<void>)[];
}