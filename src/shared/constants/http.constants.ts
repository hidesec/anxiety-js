/**
 * HTTP-related constants for the Anxiety Framework
 */

/**
 * HTTP methods supported by the framework
 */
export const HTTP_METHODS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch',
  OPTIONS: 'options',
  HEAD: 'head'
} as const;

/**
 * Common HTTP headers
 */
export const HTTP_HEADERS = {
  ACCEPT: 'accept',
  ACCEPT_ENCODING: 'accept-encoding',
  ACCEPT_LANGUAGE: 'accept-language',
  AUTHORIZATION: 'authorization',
  CACHE_CONTROL: 'cache-control',
  CONTENT_LENGTH: 'content-length',
  CONTENT_TYPE: 'content-type',
  COOKIE: 'cookie',
  HOST: 'host',
  ORIGIN: 'origin',
  REFERER: 'referer',
  USER_AGENT: 'user-agent',
  X_FORWARDED_FOR: 'x-forwarded-for',
  X_REAL_IP: 'x-real-ip'
} as const;

/**
 * Content type constants
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  XML: 'application/xml',
  HTML: 'text/html',
  TEXT: 'text/plain',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  MULTIPART_FORM_DATA: 'multipart/form-data',
  OCTET_STREAM: 'application/octet-stream'
} as const;

/**
 * Default request/response settings
 */
export const REQUEST_DEFAULTS = {
  CHARSET: 'utf-8',
  KEEP_ALIVE_TIMEOUT: 5000,
  HEADERS_TIMEOUT: 60000,
  MAX_HEADER_SIZE: 8192
} as const;