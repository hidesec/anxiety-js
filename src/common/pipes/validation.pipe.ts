import { PipeInterface, PipeMetadata, PipeValidationException } from './pipe.interface';

/**
 * Validation options for the validation pipe
 */
export interface ValidationOptions {
  /** Skip missing properties */
  skipMissingProperties?: boolean;
  /** Whitelist only known properties */
  whitelist?: boolean;
  /** Forbid non-whitelisted properties */
  forbidNonWhitelisted?: boolean;
  /** Transform values to their correct types */
  transform?: boolean;
}

/**
 * Validation rules for properties
 */
export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

/**
 * Validation schema definition
 */
export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Validation Pipe
 * Validates and transforms input data according to defined rules
 */
export class ValidationPipe implements PipeInterface {
  private schema: ValidationSchema;
  private options: ValidationOptions;

  constructor(schema: ValidationSchema, options: ValidationOptions = {}) {
    this.schema = schema;
    this.options = {
      skipMissingProperties: false,
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: false,
      ...options
    };
  }

  /**
   * Transform and validate input value
   */
  transform(value: any, metadata?: PipeMetadata): any {
    if (value === null || value === undefined) {
      throw new PipeValidationException('Value cannot be null or undefined');
    }

    if (typeof value !== 'object') {
      throw new PipeValidationException('Validation pipe expects an object');
    }

    const result: any = {};
    const errors: string[] = [];

    // Validate each property in the schema
    for (const [key, rule] of Object.entries(this.schema)) {
      const fieldValue = value[key];
      
      try {
        const validatedValue = this.validateField(key, fieldValue, rule);
        if (validatedValue !== undefined) {
          result[key] = validatedValue;
        }
      } catch (error) {
        if (error instanceof PipeValidationException) {
          errors.push(error.message);
        } else {
          errors.push(`${key}: ${(error as Error).message}`);
        }
      }
    }

    // Check for unknown properties if whitelist is enabled
    if (this.options.forbidNonWhitelisted) {
      for (const key of Object.keys(value)) {
        if (!this.schema[key]) {
          errors.push(`Unknown property: ${key}`);
        }
      }
    }

    if (errors.length > 0) {
      throw new PipeValidationException(`Validation failed: ${errors.join(', ')}`);
    }

    return result;
  }

  /**
   * Validate a single field
   */
  private validateField(fieldName: string, value: any, rule: ValidationRule): any {
    // Check required
    if (rule.required && (value === null || value === undefined || value === '')) {
      throw new PipeValidationException(`${fieldName} is required`, 400, fieldName);
    }

    // Skip validation if value is undefined and not required
    if (value === undefined && !rule.required) {
      return this.options.skipMissingProperties ? undefined : value;
    }

    // Type validation and transformation
    if (rule.type) {
      value = this.validateAndTransformType(fieldName, value, rule.type);
    }

    // String validations
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        throw new PipeValidationException(`${fieldName} must be at least ${rule.minLength} characters long`, 400, fieldName);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        throw new PipeValidationException(`${fieldName} must not exceed ${rule.maxLength} characters`, 400, fieldName);
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        throw new PipeValidationException(`${fieldName} does not match the required pattern`, 400, fieldName);
      }
    }

    // Number validations
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        throw new PipeValidationException(`${fieldName} must be at least ${rule.min}`, 400, fieldName);
      }
      if (rule.max !== undefined && value > rule.max) {
        throw new PipeValidationException(`${fieldName} must not exceed ${rule.max}`, 400, fieldName);
      }
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        const message = typeof customResult === 'string' ? customResult : `${fieldName} failed custom validation`;
        throw new PipeValidationException(message, 400, fieldName);
      }
    }

    return value;
  }

  /**
   * Validate and transform type
   */
  private validateAndTransformType(fieldName: string, value: any, expectedType: string): any {
    switch (expectedType) {
      case 'string':
        if (this.options.transform && typeof value !== 'string') {
          return String(value);
        }
        if (typeof value !== 'string') {
          throw new PipeValidationException(`${fieldName} must be a string`, 400, fieldName);
        }
        return value;

      case 'number':
        if (this.options.transform && typeof value !== 'number') {
          const num = Number(value);
          if (isNaN(num)) {
            throw new PipeValidationException(`${fieldName} must be a valid number`, 400, fieldName);
          }
          return num;
        }
        if (typeof value !== 'number') {
          throw new PipeValidationException(`${fieldName} must be a number`, 400, fieldName);
        }
        return value;

      case 'boolean':
        if (this.options.transform && typeof value !== 'boolean') {
          if (value === 'true' || value === '1' || value === 1) return true;
          if (value === 'false' || value === '0' || value === 0) return false;
          throw new PipeValidationException(`${fieldName} must be a valid boolean`, 400, fieldName);
        }
        if (typeof value !== 'boolean') {
          throw new PipeValidationException(`${fieldName} must be a boolean`, 400, fieldName);
        }
        return value;

      case 'object':
        if (typeof value !== 'object' || value === null) {
          throw new PipeValidationException(`${fieldName} must be an object`, 400, fieldName);
        }
        return value;

      case 'array':
        if (!Array.isArray(value)) {
          throw new PipeValidationException(`${fieldName} must be an array`, 400, fieldName);
        }
        return value;

      default:
        return value;
    }
  }
}