import { InterceptorInterface } from './interceptor.interface';
import { AnxietyRequest, AnxietyResponse } from '../../middleware/interfaces/middleware.interface';

/**
 * Response transformation options
 */
export interface ResponseTransformOptions {
  /** Wrap response in a standard format */
  standardFormat?: boolean;
  /** Add metadata to response */
  addMetadata?: boolean;
  /** Transform field names (e.g., camelCase to snake_case) */
  transformFields?: boolean;
  /** Custom transformation function */
  customTransform?: (data: any) => any;
}

/**
 * Standard response format
 */
export interface StandardResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  metadata?: {
    requestId?: string;
    processingTime?: number;
    version?: string;
    [key: string]: any;
  };
}

/**
 * Response Transform Interceptor
 * Transforms response data into a consistent format
 */
export class ResponseTransformInterceptor implements InterceptorInterface {
  private options: ResponseTransformOptions;

  constructor(options: ResponseTransformOptions = {}) {
    this.options = {
      standardFormat: true,
      addMetadata: true,
      transformFields: false,
      ...options
    };
  }

  async intercept(
    req: AnxietyRequest, 
    res: AnxietyResponse, 
    next: () => void, 
    handler: () => any
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Execute the route handler
      const result = await handler();
      
      // Don't transform if response was already sent
      if (res.headersSent) {
        return result;
      }

      // Transform the response
      const transformedResponse = this.transformResponse(req, result, startTime);
      
      // Send the transformed response
      res.json(transformedResponse);
      
      return transformedResponse;
    } catch (error) {
      // Handle errors and transform error responses
      const errorResponse = this.transformErrorResponse(req, error as Error, startTime);
      res.status((error as any).statusCode || 500).json(errorResponse);
      throw error;
    }
  }

  /**
   * Transform successful response
   */
  private transformResponse(req: AnxietyRequest, data: any, startTime: number): any {
    // Apply custom transformation first
    if (this.options.customTransform) {
      data = this.options.customTransform(data);
    }

    // Apply field transformation
    if (this.options.transformFields) {
      data = this.transformFields(data);
    }

    // Wrap in standard format if enabled
    if (this.options.standardFormat) {
      const standardResponse: StandardResponse = {
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      };

      // Add metadata if enabled
      if (this.options.addMetadata) {
        standardResponse.metadata = {
          requestId: req.context?.requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        };
      }

      return standardResponse;
    }

    return data;
  }

  /**
   * Transform error response
   */
  private transformErrorResponse(req: AnxietyRequest, error: any, startTime: number): any {
    const errorResponse: any = {
      success: false,
      error: {
        message: error.message || 'An error occurred',
        type: error.name || 'Error',
        statusCode: error.statusCode || 500
      },
      timestamp: new Date().toISOString()
    };

    // Add metadata for errors too
    if (this.options.addMetadata) {
      errorResponse.metadata = {
        requestId: req.context?.requestId,
        processingTime: Date.now() - startTime,
        version: '1.0.0'
      };
    }

    return errorResponse;
  }

  /**
   * Transform field names (example: camelCase to snake_case)
   */
  private transformFields(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.transformFields(item));
    }

    const transformed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const transformedKey = this.camelToSnakeCase(key);
      transformed[transformedKey] = this.transformFields(value);
    }

    return transformed;
  }

  /**
   * Convert camelCase to snake_case
   */
  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}