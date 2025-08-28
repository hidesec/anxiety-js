import { AnxietyRequest, AnxietyResponse } from '../../middleware/interfaces/middleware.interface';

/**
 * Interface for exception filters that handle errors
 */
export interface ExceptionFilterInterface {
  /**
   * Catch and handle exceptions
   * @param exception - The exception that was thrown
   * @param req - The request object
   * @param res - The response object
   */
  catch(exception: any, req: AnxietyRequest, res: AnxietyResponse): void;
}

/**
 * Arguments host interface for accessing execution context
 */
export interface ArgumentsHost {
  getArgs(): any[];
  getArgByIndex(index: number): any;
  switchToRpc(): RpcArgumentsHost;
  switchToHttp(): HttpArgumentsHost;
  switchToWs(): WsArgumentsHost;
  getType(): string;
}

/**
 * HTTP-specific arguments host
 */
export interface HttpArgumentsHost {
  getRequest(): AnxietyRequest;
  getResponse(): AnxietyResponse;
  getNext(): Function;
}

/**
 * RPC arguments host (for future use)
 */
export interface RpcArgumentsHost {
  getData(): any;
  getContext(): any;
}

/**
 * WebSocket arguments host (for future use)
 */
export interface WsArgumentsHost {
  getData(): any;
  getClient(): any;
}

/**
 * Base exception class
 */
export class HttpException extends Error {
  constructor(
    message: string | object,
    public readonly status: number,
    public readonly error?: string
  ) {
    super();
    this.message = typeof message === 'string' ? message : JSON.stringify(message);
    this.name = 'HttpException';
  }

  getResponse(): string | object {
    return this.message;
  }

  getStatus(): number {
    return this.status;
  }
}