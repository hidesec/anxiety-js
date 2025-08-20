import { Request, Response, NextFunction } from 'express';

export interface AnxietyRequest extends Request {
    user?: any;
    context?: Record<string, any>;
}

export interface AnxietyResponse extends Response {}

export type NextHandler = NextFunction;

export interface MiddlewareInterface {
    use(req: AnxietyRequest, res: AnxietyResponse, next: NextHandler): void | Promise<void>;
}