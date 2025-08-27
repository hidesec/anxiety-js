/**
 * HTTP-specific type definitions for the Anxiety Framework
 */

import { HttpStatus, HttpMethod } from '../enums';

/**
 * HTTP request configuration
 */
export interface HttpRequestConfig {
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
export interface HttpResponseConfig {
  status: HttpStatus;
  headers?: Record<string, string>;
  body?: any;
  cookies?: Record<string, string>;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
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
export interface SuccessResponse<T = any> {
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
export interface PaginatedResponse<T = any> {
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
export interface FileUploadConfig {
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
export interface CorsConfig {
  origin?: string | string[] | boolean;
  methods?: HttpMethod[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}