import { Request, Response, NextFunction } from 'express';

/**
 * Extended request interface with additional Anxiety framework properties
 */
export interface AnxietyRequest extends Request {
    user?: any;
    context?: Record<string, any>;
}

/**
 * Extended response interface
 */
export interface AnxietyResponse extends Response {}

/**
 * Next function type alias
 */
export type NextHandler = NextFunction;

/**
 * Middleware interface that all middleware classes must implement
 */
export interface MiddlewareInterface {
    use(req: AnxietyRequest, res: AnxietyResponse, next: NextHandler): void | Promise<void>;
}