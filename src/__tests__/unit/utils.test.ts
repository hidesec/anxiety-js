import {
  isConstructor,
  isPlainObject,
  isNil,
  isString,
  isNumber,
  deepMerge,
  randomString,
  capitalize,
  camelToKebab,
  kebabToCamel,
  safeJsonParse
} from '../../common/utils';

describe('Utility Functions', () => {
  describe('Type Checking Functions', () => {
    describe('isConstructor', () => {
      it('should return true for class constructors', () => {
        class TestClass {}
        expect(isConstructor(TestClass)).toBe(true);
      });

      /**
       * Test function for constructor checking
       */
      // eslint-disable-next-line require-jsdoc
      function TestFunction() {
        // Empty function for testing purposes
      }

      it('should return true for constructor functions', () => {
        expect(isConstructor(TestFunction)).toBe(true);
      });

      it('should return false for arrow functions', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const arrowFn = () => {
          // Empty arrow function for testing purposes
        };
        expect(isConstructor(arrowFn)).toBe(false);
      });

      it('should return false for non-functions', () => {
        expect(isConstructor({})).toBe(false);
        expect(isConstructor('string')).toBe(false);
        expect(isConstructor(null)).toBe(false);
      });
    });

    describe('isPlainObject', () => {
      it('should return true for plain objects', () => {
        expect(isPlainObject({})).toBe(true);
        expect(isPlainObject({ key: 'value' })).toBe(true);
      });

      it('should return false for non-plain objects', () => {
        expect(isPlainObject([])).toBe(false);
        expect(isPlainObject(new Date())).toBe(false);
        expect(isPlainObject(null)).toBe(false);
        expect(isPlainObject('string')).toBe(false);
      });
    });

    describe('isNil', () => {
      it('should return true for null and undefined', () => {
        expect(isNil(null)).toBe(true);
        expect(isNil(undefined)).toBe(true);
      });

      it('should return false for other values', () => {
        expect(isNil(0)).toBe(false);
        expect(isNil('')).toBe(false);
        expect(isNil(false)).toBe(false);
        expect(isNil({})).toBe(false);
      });
    });

    describe('isString', () => {
      it('should return true for strings', () => {
        expect(isString('hello')).toBe(true);
        expect(isString('')).toBe(true);
      });

      it('should return false for non-strings', () => {
        expect(isString(123)).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString(null)).toBe(false);
      });
    });

    describe('isNumber', () => {
      it('should return true for valid numbers', () => {
        expect(isNumber(123)).toBe(true);
        expect(isNumber(0)).toBe(true);
        expect(isNumber(-456)).toBe(true);
        expect(isNumber(3.14)).toBe(true);
      });

      it('should return false for NaN and non-numbers', () => {
        expect(isNumber(NaN)).toBe(false);
        expect(isNumber('123')).toBe(false);
        expect(isNumber({})).toBe(false);
      });
    });
  });

  describe('Object Manipulation', () => {
    describe('deepMerge', () => {
      it('should merge objects deeply', () => {
        const target = {
          a: 1,
          b: {
            c: 2,
            d: 3
          }
        };
        const source = {
          b: {
            d: 4,
            e: 5
          },
          f: 6
        };

        const result = deepMerge(target, source);

        expect(result).toEqual({
          a: 1,
          b: {
            c: 2,
            d: 4,
            e: 5
          },
          f: 6
        });
      });

      it('should not mutate the original target', () => {
        const target = { a: 1, b: { c: 2 } };
        const source = { b: { d: 3 } };
        const original = JSON.parse(JSON.stringify(target));

        deepMerge(target, source);

        expect(target).toEqual(original);
      });
    });
  });

  describe('String Utilities', () => {
    describe('randomString', () => {
      it('should generate string of specified length', () => {
        const result = randomString(10);
        expect(result).toHaveLength(10);
        expect(typeof result).toBe('string');
      });

      it('should generate default length string', () => {
        const result = randomString();
        expect(result).toHaveLength(8);
      });

      it('should generate different strings on multiple calls', () => {
        const result1 = randomString(20);
        const result2 = randomString(20);
        expect(result1).not.toBe(result2);
      });
    });

    describe('capitalize', () => {
      it('should capitalize first letter', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(capitalize('world')).toBe('World');
      });

      it('should handle single character', () => {
        expect(capitalize('a')).toBe('A');
      });

      it('should handle empty string', () => {
        expect(capitalize('')).toBe('');
      });
    });

    describe('camelToKebab', () => {
      it('should convert camelCase to kebab-case', () => {
        expect(camelToKebab('camelCase')).toBe('camel-case');
        expect(camelToKebab('someVariableName')).toBe('some-variable-name');
      });

      it('should handle single words', () => {
        expect(camelToKebab('hello')).toBe('hello');
      });
    });

    describe('kebabToCamel', () => {
      it('should convert kebab-case to camelCase', () => {
        expect(kebabToCamel('kebab-case')).toBe('kebabCase');
        expect(kebabToCamel('some-variable-name')).toBe('someVariableName');
      });

      it('should handle single words', () => {
        expect(kebabToCamel('hello')).toBe('hello');
      });
    });
  });

  describe('JSON Utilities', () => {
    describe('safeJsonParse', () => {
      it('should parse valid JSON', () => {
        const json = '{"key": "value"}';
        const result = safeJsonParse(json, {});
        expect(result).toEqual({ key: 'value' });
      });

      it('should return fallback for invalid JSON', () => {
        const invalidJson = '{"key": invalid}';
        const fallback = { error: true };
        const result = safeJsonParse(invalidJson, fallback);
        expect(result).toBe(fallback);
      });

      it('should return fallback for non-string input', () => {
        const fallback = { default: true };
        const result = safeJsonParse(null as any, fallback);
        expect(result).toBe(fallback);
      });
    });
  });
});