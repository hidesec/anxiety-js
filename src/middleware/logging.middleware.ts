import { MiddlewareInterface, AnxietyRequest, AnxietyResponse, NextHandler } from '../package/interface/middleware/middleware.interface';
import chalk from 'chalk';

export class LoggingMiddleware implements MiddlewareInterface {
  use(req: AnxietyRequest, res: AnxietyResponse, next: NextHandler): void {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    req.context = {
      ...req.context,
      requestId,
      startTime
    };

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

    console.log(
      chalk.magenta(`[${requestId}]`) +
      chalk.gray(' Headers: ') +
      chalk.white(JSON.stringify(req.headers, null, 2))
    );

    if (req.body && Object.keys(req.body).length > 0) {
      console.log(
        chalk.magenta(`[${requestId}]`) +
        chalk.gray(' Body: ') +
        chalk.white(JSON.stringify(req.body, null, 2))
      );
    }

    res.on('finish', () => {
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
    });

    next();
  }
}