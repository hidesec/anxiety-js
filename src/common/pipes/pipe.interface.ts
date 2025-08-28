/**
 * Interface for data transformation and validation pipes
 */
export type PipeInterface<T = any, R = any> = {
  /**
   * Transform input data
   * @param value - The input value to transform
   * @param metadata - Optional metadata about the transformation context
   * @returns The transformed value
   */
  transform(value: T, metadata?: PipeMetadata): R;
}

/**
 * Metadata interface for pipe transformations
 */
export type PipeMetadata = {
  type?: 'body' | 'query' | 'param' | 'custom';
  data?: string;
  metatype?: any;
}

/**
 * Exception thrown by pipes when validation fails
 */
export class PipeValidationException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'PipeValidationException';
  }
}