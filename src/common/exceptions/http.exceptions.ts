import { HttpStatus } from '../../shared/enums';

/**
 * Base exception class for the Anxiety Framework
 */
export abstract class AnxietyException extends Error {
  abstract readonly status: HttpStatus;
  
  constructor(
    public readonly message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Get exception as JSON response
   */
  toJSON() {
    return {
      error: this.name,
      message: this.message,
      statusCode: this.status,
      timestamp: new Date().toISOString(),
      details: this.details
    };
  }
}

/**
 * HTTP Exception for custom HTTP errors
 */
export class HttpException extends AnxietyException {
  constructor(
    message: string,
    public readonly status: HttpStatus,
    details?: any
  ) {
    super(message, details);
  }
}

/**
 * Bad Request Exception (400)
 */
export class BadRequestException extends AnxietyException {
  readonly status = HttpStatus.BAD_REQUEST;
}

/**
 * Unauthorized Exception (401)
 */
export class UnauthorizedException extends AnxietyException {
  readonly status = HttpStatus.UNAUTHORIZED;
}

/**
 * Forbidden Exception (403)
 */
export class ForbiddenException extends AnxietyException {
  readonly status = HttpStatus.FORBIDDEN;
}

/**
 * Not Found Exception (404)
 */
export class NotFoundException extends AnxietyException {
  readonly status = HttpStatus.NOT_FOUND;
}

/**
 * Method Not Allowed Exception (405)
 */
export class MethodNotAllowedException extends AnxietyException {
  readonly status = HttpStatus.METHOD_NOT_ALLOWED;
}

/**
 * Conflict Exception (409)
 */
export class ConflictException extends AnxietyException {
  readonly status = HttpStatus.CONFLICT;
}

/**
 * Unprocessable Entity Exception (422)
 */
export class UnprocessableEntityException extends AnxietyException {
  readonly status = HttpStatus.UNPROCESSABLE_ENTITY;
}

/**
 * Internal Server Error Exception (500)
 */
export class InternalServerErrorException extends AnxietyException {
  readonly status = HttpStatus.INTERNAL_SERVER_ERROR;
}

/**
 * Not Implemented Exception (501)
 */
export class NotImplementedException extends AnxietyException {
  readonly status = HttpStatus.NOT_IMPLEMENTED;
}

/**
 * Bad Gateway Exception (502)
 */
export class BadGatewayException extends AnxietyException {
  readonly status = HttpStatus.BAD_GATEWAY;
}

/**
 * Service Unavailable Exception (503)
 */
export class ServiceUnavailableException extends AnxietyException {
  readonly status = HttpStatus.SERVICE_UNAVAILABLE;
}