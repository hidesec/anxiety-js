/**
 * Common enumerations for the Anxiety Framework
 */

/**
 * Environment types
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
  STAGING = 'staging'
}

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose'
}

/**
 * Middleware execution order
 */
export enum MiddlewareOrder {
  FIRST = 'FIRST',
  BEFORE_ROUTE = 'BEFORE_ROUTE',
  ROUTE = 'ROUTE',
  AFTER_ROUTE = 'AFTER_ROUTE',
  LAST = 'LAST'
}

/**
 * Request validation scopes
 */
export enum ValidationScope {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
  HEADERS = 'headers'
}

/**
 * Cache strategies
 */
export enum CacheStrategy {
  NO_CACHE = 'no-cache',
  CACHE_FIRST = 'cache-first',
  NETWORK_FIRST = 'network-first',
  CACHE_ONLY = 'cache-only',
  NETWORK_ONLY = 'network-only'
}

/**
 * Authentication strategies
 */
export enum AuthStrategy {
  JWT = 'jwt',
  BASIC = 'basic',
  BEARER = 'bearer',
  API_KEY = 'api-key',
  OAUTH2 = 'oauth2'
}