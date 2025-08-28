import {
  ValidationPipe,
  ParseIntPipe,
  ParseFloatPipe,
  ParseBoolPipe,
  PipeValidationException
} from '../../common/pipes';

describe('Pipes', () => {
  describe('ValidationPipe', () => {
    it('should validate required fields', () => {
      const schema = {
        name: { required: true, type: 'string' as const },
        age: { required: true, type: 'number' as const }
      };
      const pipe = new ValidationPipe(schema);
      
      expect(() => {
        pipe.transform({ name: 'John' }); // missing age
      }).toThrow(PipeValidationException);
    });

    it('should validate field types', () => {
      const schema = {
        name: { type: 'string' as const },
        age: { type: 'number' as const }
      };
      const pipe = new ValidationPipe(schema);
      
      expect(() => {
        pipe.transform({ name: 'John', age: 'not-a-number' });
      }).toThrow(PipeValidationException);
    });

    it('should validate string length', () => {
      const schema = {
        username: { type: 'string' as const, minLength: 3, maxLength: 10 }
      };
      const pipe = new ValidationPipe(schema);
      
      expect(() => {
        pipe.transform({ username: 'ab' }); // too short
      }).toThrow(PipeValidationException);
      
      expect(() => {
        pipe.transform({ username: 'verylongusername' }); // too long
      }).toThrow(PipeValidationException);
      
      const result = pipe.transform({ username: 'john123' });
      expect(result.username).toBe('john123');
    });

    it('should validate number ranges', () => {
      const schema = {
        score: { type: 'number' as const, min: 0, max: 100 }
      };
      const pipe = new ValidationPipe(schema);
      
      expect(() => {
        pipe.transform({ score: -10 });
      }).toThrow(PipeValidationException);
      
      expect(() => {
        pipe.transform({ score: 150 });
      }).toThrow(PipeValidationException);
      
      const result = pipe.transform({ score: 85 });
      expect(result.score).toBe(85);
    });

    it('should validate with pattern', () => {
      const schema = {
        email: { type: 'string' as const, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      };
      const pipe = new ValidationPipe(schema);
      
      expect(() => {
        pipe.transform({ email: 'invalid-email' });
      }).toThrow(PipeValidationException);
      
      const result = pipe.transform({ email: 'john@example.com' });
      expect(result.email).toBe('john@example.com');
    });

    it('should run custom validation', () => {
      const schema = {
        password: {
          type: 'string' as const,
          custom: (value: string) => {
            if (value.length < 8) return 'Password must be at least 8 characters';
            if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter';
            return true;
          }
        }
      };
      const pipe = new ValidationPipe(schema);
      
      expect(() => {
        pipe.transform({ password: 'weak' });
      }).toThrow('Password must be at least 8 characters');
      
      expect(() => {
        pipe.transform({ password: 'weakpassword' });
      }).toThrow('Password must contain uppercase letter');
      
      const result = pipe.transform({ password: 'StrongPassword123' });
      expect(result.password).toBe('StrongPassword123');
    });

    it('should transform types when enabled', () => {
      const schema = {
        age: { type: 'number' as const },
        active: { type: 'boolean' as const }
      };
      const pipe = new ValidationPipe(schema, { transform: true });
      
      const result = pipe.transform({ age: '25', active: 'true' });
      expect(result.age).toBe(25);
      expect(result.active).toBe(true);
    });

    it('should handle whitelist options', () => {
      const schema = {
        name: { type: 'string' as const }
      };
      const pipe = new ValidationPipe(schema, { forbidNonWhitelisted: true });
      
      expect(() => {
        pipe.transform({ name: 'John', unknown: 'value' });
      }).toThrow('Unknown property: unknown');
    });
  });

  describe('ParseIntPipe', () => {
    let pipe: ParseIntPipe;

    beforeEach(() => {
      pipe = new ParseIntPipe();
    });

    it('should parse valid integer strings', () => {
      expect(pipe.transform('123')).toBe(123);
      expect(pipe.transform('-456')).toBe(-456);
    });

    it('should throw for invalid integers', () => {
      expect(() => pipe.transform('abc')).toThrow(PipeValidationException);
      expect(pipe.transform('12.34')).toBe(12); // parseInt parses the integer part
    });

    it('should validate range when configured', () => {
      const pipe = new ParseIntPipe({ min: 0, max: 100 });
      
      expect(() => pipe.transform('-10')).toThrow(PipeValidationException);
      expect(() => pipe.transform('150')).toThrow(PipeValidationException);
      expect(pipe.transform('50')).toBe(50);
    });

    it('should handle different radix', () => {
      const pipe = new ParseIntPipe({ radix: 16 });
      expect(pipe.transform('FF')).toBe(255);
    });
  });

  describe('ParseFloatPipe', () => {
    let pipe: ParseFloatPipe;

    beforeEach(() => {
      pipe = new ParseFloatPipe();
    });

    it('should parse valid float strings', () => {
      expect(pipe.transform('123.45')).toBe(123.45);
      expect(pipe.transform('-67.89')).toBe(-67.89);
    });

    it('should throw for invalid floats', () => {
      expect(() => pipe.transform('abc')).toThrow(PipeValidationException);
      expect(() => pipe.transform('')).toThrow(PipeValidationException);
    });

    it('should validate range', () => {
      const pipe = new ParseFloatPipe({ min: 0, max: 100 });
      
      expect(() => pipe.transform('-10.5')).toThrow(PipeValidationException);
      expect(() => pipe.transform('150.5')).toThrow(PipeValidationException);
      expect(pipe.transform('50.5')).toBe(50.5);
    });

    it('should handle precision', () => {
      const pipe = new ParseFloatPipe({ precision: 2 });
      expect(pipe.transform('123.456789')).toBe(123.46);
    });
  });

  describe('ParseBoolPipe', () => {
    let pipe: ParseBoolPipe;

    beforeEach(() => {
      pipe = new ParseBoolPipe();
    });

    it('should parse boolean values', () => {
      expect(pipe.transform(true)).toBe(true);
      expect(pipe.transform(false)).toBe(false);
    });

    it('should parse string boolean values', () => {
      expect(pipe.transform('true')).toBe(true);
      expect(pipe.transform('false')).toBe(false);
      expect(pipe.transform('TRUE')).toBe(true);
      expect(pipe.transform('FALSE')).toBe(false);
      expect(pipe.transform('1')).toBe(true);
      expect(pipe.transform('0')).toBe(false);
      expect(pipe.transform('yes')).toBe(true);
      expect(pipe.transform('no')).toBe(false);
    });

    it('should parse number boolean values', () => {
      expect(pipe.transform(1)).toBe(true);
      expect(pipe.transform(0)).toBe(false);
      expect(pipe.transform(42)).toBe(true);
    });

    it('should throw for invalid boolean values', () => {
      expect(() => pipe.transform('maybe')).toThrow(PipeValidationException);
      expect(() => pipe.transform('invalid')).toThrow(PipeValidationException);
    });

    it('should throw for null/undefined', () => {
      expect(() => pipe.transform(null)).toThrow(PipeValidationException);
      expect(() => pipe.transform(undefined)).toThrow(PipeValidationException);
    });
  });
});