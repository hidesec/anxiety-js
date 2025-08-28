/**
 * Common type definitions for the Anxiety Framework
 */

/**
 * Generic constructor type
 */
export type Constructor<T = object> = new (...args: any[]) => T;

/**
 * Class decorator type
 */
export type ClassDecorator<T = any> = (target: Constructor<T>) => void | Constructor<T>;

/**
 * Method decorator type  
 */
export type MethodDecorator<T = any> = (
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => void | TypedPropertyDescriptor<T>;

/**
 * Property decorator type
 */
export type PropertyDecorator = (target: any, propertyKey: string | symbol) => void;

/**
 * Parameter decorator type
 */
export type ParameterDecorator = (
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => void;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make certain keys optional
 */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required keys type  
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Optional keys type
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * Non-nullable type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Promise-like type
 */
export type Awaitable<T> = T | Promise<T>;

/**
 * Function type
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * JSON serializable types
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

/**
 * HTTP method string union type
 */
export type HttpMethodString = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

/**
 * Middleware function type
 */
export type MiddlewareFunction = (req: any, res: any, next: any) => void | Promise<void>;

/**
 * Route handler function type
 */
export type RouteHandler = (req: any, res: any, next?: any) => any;

/**
 * Validation result type
 */
export type ValidationResult = {
  isValid: boolean;
  errors?: string[];
  value?: any;
};