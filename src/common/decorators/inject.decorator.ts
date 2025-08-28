import 'reflect-metadata';

/**
 * Inject decorator for property-based dependency injection
 * @param token - Injection token (string or constructor)
 */
export function Inject(token: string | (new (...args: any[]) => any)): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const existingTokens = Reflect.getMetadata('inject_tokens', target) || {};
    existingTokens[propertyKey] = token;
    Reflect.defineMetadata('inject_tokens', existingTokens, target);
  };
}

/**
 * Optional decorator for optional dependencies
 */
export function Optional(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const optionalKeys = Reflect.getMetadata('optional_keys', target) || [];
    optionalKeys.push(propertyKey);
    Reflect.defineMetadata('optional_keys', optionalKeys, target);
  };
}