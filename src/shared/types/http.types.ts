/**
 * HTTP-specific type definitions for the Anxiety Framework
 */

import { HttpStatus, HttpMethod } from '../enums';

/**
 * HTTP request configuration
 */
export type HttpRequestConfig = {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  query?: Record<string, any>;
  body?: any;
  timeout?: number;
}

/**
 * HTTP response configuration
 */
export type HttpResponseConfig = {
  status: HttpStatus;
  headers?: Record<string, string>;
  body?: any;
  cookies?: Record<string, string>;
}

/**
 * Error response structure
 */
export type ErrorResponse = {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: any;
}

/**
 * Success response structure
 */
export type SuccessResponse<T = any> = {
  data: T;
  message?: string;
  statusCode: number;
  timestamp: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

/**
 * Paginated response structure
 */
export type PaginatedResponse<T = any> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  timestamp: string;
}

/**
 * File upload configuration
 */
export type FileUploadConfig = {
  destination: string;
  filename?: string;
  limits?: {
    fileSize?: number;
    files?: number;
    fields?: number;
  };
  fileFilter?: (file: any) => boolean;
}

/**
 * CORS configuration
 */
export type CorsConfig = {
  origin?: string | string[] | boolean;
  methods?: HttpMethod[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Rate limiting configuration
 */
export type RateLimitConfig = {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}