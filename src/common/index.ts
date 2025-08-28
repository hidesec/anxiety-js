/**
 * Common module barrel export
 */

export * from './decorators';
export * from './exceptions';
export * from './utils';

// Filters (Exception Filters) - export specific items to avoid conflicts
export {
  ExceptionFilterInterface,
  ArgumentsHost,
  HttpArgumentsHost,
  RpcArgumentsHost,
  WsArgumentsHost
} from './filters/exception-filter.interface';
export {
  GlobalExceptionFilter,
  HttpExceptionFilter,
  ValidationExceptionFilter
} from './filters/global-exception.filter';

// Guards (Authentication & Authorization)
export * from './guards';

// Interceptors (Request/Response Transformation)
export * from './interceptors';

// Pipes (Data Transformation & Validation)
export * from './pipes';

// Re-export database decorators
export {
  InjectRepository,
  Entity,
  Transaction,
  Transactional,
  Cache,
  Validate
} from '../database/decorators/database.decorator';

// Re-export config decorators
export {
  InjectConfig,
  Config,
  ConfigValue,
  Environment
} from '../config/decorators/config.decorator';