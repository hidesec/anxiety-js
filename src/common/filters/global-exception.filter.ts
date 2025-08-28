import { ExceptionFilterInterface, HttpException } from './exception-filter.interface';
import { AnxietyRequest, AnxietyResponse } from '../../middleware/interfaces/middleware.interface';

/**
 * Global Exception Filter
 * Handles all unhandled exceptions in the application
 */
export class GlobalExceptionFilter implements ExceptionFilterInterface {
  catch(exception: any, req: AnxietyRequest, res: AnxietyResponse): void {
    const timestamp = new Date().toISOString();
    const path = req.originalUrl;
    const method = req.method;
    
    let status: number;
    let message: string | object;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
      error = exception.error || exception.name;
    } else {
      // Handle different types of errors
      status = 500;
      error = 'Internal Server Error';
      
      if (exception instanceof SyntaxError) {
        status = 400;
        error = 'Bad Request';
        message = 'Invalid JSON syntax';
      } else if (exception instanceof TypeError) {
        status = 400;
        error = 'Bad Request';
        message = 'Invalid data type';
      } else if (exception.name === 'ValidationError') {
        status = 400;
        error = 'Validation Failed';
        message = exception.message;
      } else if (exception.name === 'UnauthorizedError') {
        status = 401;
        error = 'Unauthorized';
        message = exception.message || 'Authentication required';
      } else if (exception.name === 'ForbiddenError') {
        status = 403;
        error = 'Forbidden';
        message = exception.message || 'Access denied';
      } else if (exception.name === 'NotFoundError') {
        status = 404;
        error = 'Not Found';
        message = exception.message || 'Resource not found';
      } else {
        message = process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : exception.message || 'An unexpected error occurred';
      }
    }

    // Log the error (in non-test environment)
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[${timestamp}] ${method} ${path} - ${status} ${error}`);
      if (status >= 500) {
        console.error('Stack trace:', exception.stack);
      }
    }

    // Prepare error response
    const errorResponse = {
      statusCode: status,
      timestamp,
      path,
      method,
      error,
      message,
      ...(process.env.NODE_ENV !== 'production' && {
        stack: exception.stack
      })
    };

    // Add request context if available
    if (req.context?.requestId) {
      (errorResponse as any).requestId = req.context.requestId;
    }

    res.status(status).json(errorResponse);
  }
}

/**
 * HTTP Exception Filter
 * Specifically handles HttpException instances
 */
export class HttpExceptionFilter implements ExceptionFilterInterface {
  catch(exception: HttpException, req: AnxietyRequest, res: AnxietyResponse): void {
    const status = exception.getStatus();
    const response = exception.getResponse();
    const timestamp = new Date().toISOString();
    const path = req.originalUrl;
    const method = req.method;

    const errorResponse = {
      statusCode: status,
      timestamp,
      path,
      method,
      message: response,
      error: exception.error || exception.name
    };

    // Add request context if available
    if (req.context?.requestId) {
      (errorResponse as any).requestId = req.context.requestId;
    }

    if (process.env.NODE_ENV !== 'test') {
      console.error(`[${timestamp}] ${method} ${path} - ${status} ${exception.error || exception.name}`);
    }

    res.status(status).json(errorResponse);
  }
}

/**
 * Validation Exception Filter
 * Handles validation-specific errors
 */
export class ValidationExceptionFilter implements ExceptionFilterInterface {
  catch(exception: any, req: AnxietyRequest, res: AnxietyResponse): void {
    const timestamp = new Date().toISOString();
    const path = req.originalUrl;
    const method = req.method;
    
    const status = 400;
    let message = 'Validation failed';
    let details: any;

    // Handle different validation error formats
    if (exception.name === 'ValidationError') {
      message = exception.message;
      details = exception.errors || exception.details;
    } else if (exception.name === 'PipeValidationException') {
      message = exception.message;
      if (exception.field) {
        details = { field: exception.field };
      }
    } else if (Array.isArray(exception)) {
      // Handle array of validation errors
      details = exception;
      message = `Validation failed on ${exception.length} field(s)`;
    }

    const errorResponse = {
      statusCode: status,
      timestamp,
      path,
      method,
      error: 'Validation Error',
      message,
      details
    };

    if (req.context?.requestId) {
      (errorResponse as any).requestId = req.context.requestId;
    }

    if (process.env.NODE_ENV !== 'test') {
      console.error(`[${timestamp}] ${method} ${path} - Validation Error: ${message}`);
    }

    res.status(status).json(errorResponse);
  }
}