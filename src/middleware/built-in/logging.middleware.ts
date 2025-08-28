import { MiddlewareInterface, AnxietyRequest, AnxietyResponse, NextHandler } from '../interfaces/middleware.interface';
import chalk from 'chalk';

/**
 * Logging middleware for request/response logging with colored output
 */
export class LoggingMiddleware implements MiddlewareInterface {
  use(req: AnxietyRequest, res: AnxietyResponse, next: NextHandler): void {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    // Add request context
    req.context = {
      ...req.context,
      requestId,
      startTime
    };

    // Only log in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      // Log incoming request
      console.log(
        chalk.blue(`[${new Date().toISOString()}]`) +
        ' ' +
        chalk.magenta(`[${requestId}]`) +
        ' ' +
        chalk.green(`${req.method}`) +
        ' ' +
        chalk.yellow(`${req.originalUrl}`) +
        chalk.white(' - ') +
        chalk.cyan('Start')
      );

      // Log headers
      console.log(
        chalk.magenta(`[${requestId}]`) +
        chalk.gray(' Headers: ') +
        chalk.white(JSON.stringify(req.headers, null, 2))
      );

      // Log body if present
      if (req.body && Object.keys(req.body).length > 0) {
        console.log(
          chalk.magenta(`[${requestId}]`) +
          chalk.gray(' Body: ') +
          chalk.white(JSON.stringify(req.body, null, 2))
        );
      }
    }

    // Log response when finished
    res.on('finish', () => {
      if (process.env.NODE_ENV !== 'test') {
        const duration = Date.now() - startTime;
        const statusColor =
          res.statusCode >= 500 ? chalk.red :
          res.statusCode >= 400 ? chalk.yellow :
          chalk.green;
          
        console.log(
          chalk.blue(`[${new Date().toISOString()}]`) +
          ' ' +
          chalk.magenta(`[${requestId}]`) +
          ' ' +
          chalk.green(`${req.method}`) +
          ' ' +
          chalk.yellow(`${req.originalUrl}`) +
          chalk.white(' - ') +
          statusColor(`${res.statusCode}`) +
          chalk.white(` (${duration}ms)`)
        );
      }
    });

    next();
  }
}