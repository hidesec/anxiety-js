import { HttpException } from './exception-filter.interface';

/**
 * Bad Request Exception (400)
 */
export class BadRequestException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Bad Request', 400, 'Bad Request');
  }
}

/**
 * Unauthorized Exception (401)
 */
export class UnauthorizedException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Unauthorized', 401, 'Unauthorized');
  }
}

/**
 * Forbidden Exception (403)
 */
export class ForbiddenException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Forbidden', 403, 'Forbidden');
  }
}

/**
 * Not Found Exception (404)
 */
export class NotFoundException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Not Found', 404, 'Not Found');
  }
}

/**
 * Method Not Allowed Exception (405)
 */
export class MethodNotAllowedException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Method Not Allowed', 405, 'Method Not Allowed');
  }
}

/**
 * Conflict Exception (409)
 */
export class ConflictException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Conflict', 409, 'Conflict');
  }
}

/**
 * Unprocessable Entity Exception (422)
 */
export class UnprocessableEntityException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Unprocessable Entity', 422, 'Unprocessable Entity');
  }
}

/**
 * Too Many Requests Exception (429)
 */
export class TooManyRequestsException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Too Many Requests', 429, 'Too Many Requests');
  }
}

/**
 * Internal Server Error Exception (500)
 */
export class InternalServerErrorException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Internal Server Error', 500, 'Internal Server Error');
  }
}

/**
 * Not Implemented Exception (501)
 */
export class NotImplementedException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Not Implemented', 501, 'Not Implemented');
  }
}

/**
 * Bad Gateway Exception (502)
 */
export class BadGatewayException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Bad Gateway', 502, 'Bad Gateway');
  }
}

/**
 * Service Unavailable Exception (503)
 */
export class ServiceUnavailableException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Service Unavailable', 503, 'Service Unavailable');
  }
}

/**
 * Gateway Timeout Exception (504)
 */
export class GatewayTimeoutException extends HttpException {
  constructor(message?: string | object) {
    super(message || 'Gateway Timeout', 504, 'Gateway Timeout');
  }
}