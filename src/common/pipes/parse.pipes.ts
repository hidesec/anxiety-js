import { PipeInterface, PipeMetadata, PipeValidationException } from './pipe.interface';

/**
 * Parse Integer Pipe
 * Transforms string values to integers with validation
 */
export class ParseIntPipe implements PipeInterface<string, number> {
  private radix: number;
  private min?: number;
  private max?: number;

  constructor(options: { radix?: number; min?: number; max?: number } = {}) {
    this.radix = options.radix || 10;
    this.min = options.min;
    this.max = options.max;
  }

  /**
   * Transform string to integer
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, _metadata?: PipeMetadata): number {
    if (value === null || value === undefined || value === '') {
      throw new PipeValidationException('Value is required for integer parsing');
    }

    const parsed = parseInt(value.toString(), this.radix);
    
    if (isNaN(parsed)) {
      throw new PipeValidationException(`'${value}' is not a valid integer`);
    }

    if (this.min !== undefined && parsed < this.min) {
      throw new PipeValidationException(`Value must be at least ${this.min}`);
    }

    if (this.max !== undefined && parsed > this.max) {
      throw new PipeValidationException(`Value must not exceed ${this.max}`);
    }

    return parsed;
  }
}

/**
 * Parse Float Pipe
 * Transforms string values to floating-point numbers with validation
 */
export class ParseFloatPipe implements PipeInterface<string, number> {
  private min?: number;
  private max?: number;
  private precision?: number;

  constructor(options: { min?: number; max?: number; precision?: number } = {}) {
    this.min = options.min;
    this.max = options.max;
    this.precision = options.precision;
  }

  /**
   * Transform string to float
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, _metadata?: PipeMetadata): number {
    if (value === null || value === undefined || value === '') {
      throw new PipeValidationException('Value is required for float parsing');
    }

    const parsed = parseFloat(value.toString());
    
    if (isNaN(parsed)) {
      throw new PipeValidationException(`'${value}' is not a valid number`);
    }

    if (this.min !== undefined && parsed < this.min) {
      throw new PipeValidationException(`Value must be at least ${this.min}`);
    }

    if (this.max !== undefined && parsed > this.max) {
      throw new PipeValidationException(`Value must not exceed ${this.max}`);
    }

    let result = parsed;
    if (this.precision !== undefined) {
      result = parseFloat(parsed.toFixed(this.precision));
    }

    return result;
  }
}

/**
 * Parse Boolean Pipe
 * Transforms various input types to boolean values
 */
export class ParseBoolPipe implements PipeInterface<any, boolean> {
  /**
   * Transform value to boolean
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, _metadata?: PipeMetadata): boolean {
    if (value === null || value === undefined) {
      throw new PipeValidationException('Value is required for boolean parsing');
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on') {
        return true;
      }
      if (lower === 'false' || lower === '0' || lower === 'no' || lower === 'off') {
        return false;
      }
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    throw new PipeValidationException(`'${value}' is not a valid boolean value`);
  }
}