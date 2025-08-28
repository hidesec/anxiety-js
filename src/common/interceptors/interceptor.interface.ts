import { AnxietyRequest, AnxietyResponse } from '../../middleware/interfaces/middleware.interface';

/**
 * Interface for interceptors that can modify requests and responses
 */
export type InterceptorInterface = {
  /**
   * Intercept method called before and after route handler execution
   * @param req - The request object
   * @param res - The response object
   * @param next - Function to call the next handler
   * @param handler - The route handler function
   */
  intercept(
    req: AnxietyRequest, 
    res: AnxietyResponse, 
    next: () => void, 
    handler: () => any
  ): Promise<any> | any;
}

/**
 * Execution context for interceptors
 */
export type ExecutionContext = {
  switchToHttp(): {
    getRequest(): AnxietyRequest;
    getResponse(): AnxietyResponse;
  };
  getClass(): any;
  getHandler(): (...args: unknown[]) => unknown;
  getArgs(): any[];
  getArgByIndex(index: number): any;
  switchToRpc?(): any;
  switchToWs?(): any;
}

/**
 * Call handler interface
 */
export type CallHandler = {
  handle(): Promise<any>;
}