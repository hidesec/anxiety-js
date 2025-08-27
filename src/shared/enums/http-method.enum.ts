/**
 * HTTP Methods Enum
 */
export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
  OPTIONS = 'options',
  HEAD = 'head'
}

/**
 * HTTP Methods as string array for validation
 */
export const HTTP_METHODS = Object.values(HttpMethod);