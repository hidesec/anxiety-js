/**
 * Framework constants for Anxiety JS
 */

/**
 * Metadata keys used by the framework for reflection
 */
export const METADATA_KEYS = {
  CONTROLLER_PREFIX: 'controller_prefix',
  IS_CONTROLLER: 'is_controller',
  ROUTES: 'routes',
  MIDDLEWARE: 'anxiety_middleware',
  ROUTE_PARAMS: 'route_param_metadata',
  INJECTABLE: 'is_injectable',
  GUARD: 'is_guard',
  INTERCEPTOR: 'is_interceptor',
  PIPE: 'is_pipe',
  FILTER: 'is_filter'
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  PORT: 3000,
  HOST: 'localhost',
  CORS_ENABLED: true,
  BODY_PARSER_ENABLED: true,
  GLOBAL_PREFIX: '',
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_REQUEST_SIZE: '10mb'
} as const;

/**
 * Framework information
 */
export const FRAMEWORK_INFO = {
  NAME: 'Anxiety Framework',
  VERSION: '1.0.0',
  DESCRIPTION: 'Simple Backend Framework for Node.js with TypeScript',
  AUTHOR: 'Anxiety JS Team'
} as const;

/**
 * Default middleware order priority
 */
export const MIDDLEWARE_PRIORITY = {
  CORS: 1000,
  SECURITY: 900,
  LOGGING: 800,
  AUTHENTICATION: 700,
  AUTHORIZATION: 600,
  VALIDATION: 500,
  TRANSFORM: 400,
  BUSINESS_LOGIC: 300,
  ERROR_HANDLING: 100
} as const;

/**
 * Route parameter types
 */
export const PARAM_TYPES = {
  PARAM: 'param',
  QUERY: 'query', 
  BODY: 'body',
  HEADERS: 'headers',
  REQUEST: 'request',
  RESPONSE: 'response'
} as const;