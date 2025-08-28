import 'reflect-metadata';
import { ProviderScope } from '../../core/interfaces';
import { METADATA_KEYS } from '../../shared/constants';

/**
 * Injectable decorator options
 */
export type InjectableOptions = {
  scope?: ProviderScope;
  [key: string]: unknown;
}

/**
 * Injectable decorator for marking classes as injectable services
 * @param options - Injectable configuration options
 */
export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
    Reflect.defineMetadata('injectable_options', options, target);
    
    // Store parameter types for dependency injection
    const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
    Reflect.defineMetadata('injectable_dependencies', paramTypes, target);
  };
}