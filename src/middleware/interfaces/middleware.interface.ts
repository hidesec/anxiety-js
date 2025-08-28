import { Request, Response, NextFunction } from 'express';
import { User } from '../../entities/user.entity';

/**
 * Extended request interface with additional Anxiety framework properties
 */
export type AnxietyRequest = {
    user?: User;
    context?: Record<string, unknown>;
} & Request

/**
 * Extended response interface
 */
export type AnxietyResponse = Record<string, never> & Response

/**
 * Next function type alias
 */
export type NextHandler = NextFunction;

/**
 * Middleware interface that all middleware classes must implement
 */
export type MiddlewareInterface = {
    use(req: AnxietyRequest, res: AnxietyResponse, next: NextHandler): void | Promise<void>;
}