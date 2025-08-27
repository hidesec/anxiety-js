/**
 * Provider and dependency injection interfaces for the Anxiety Framework
 */

import { Constructor } from '../../shared/types';

/**
 * Provider interface
 */
export interface Provider<T = any> {
  provide: string | Constructor<T>;
  useClass?: Constructor<T>;
  useValue?: T;
  useFactory?: (...args: any[]) => T | Promise<T>;
  inject?: (string | Constructor)[];
  scope?: ProviderScope;
}

/**
 * Class provider interface
 */
export interface ClassProvider<T = any> {
  provide: string | Constructor<T>;
  useClass: Constructor<T>;
}

/**
 * Value provider interface
 */
export interface ValueProvider<T = any> {
  provide: string | Constructor<T>;
  useValue: T;
}

/**
 * Factory provider interface
 */
export interface FactoryProvider<T = any> {
  provide: string | Constructor<T>;
  useFactory: (...args: any[]) => T | Promise<T>;
  inject?: (string | Constructor)[];
}

/**
 * Provider scope enumeration
 */
export enum ProviderScope {
  SINGLETON = 'singleton',
  TRANSIENT = 'transient',
  REQUEST = 'request'
}

/**
 * Injectable metadata interface
 */
export interface InjectableMetadata {
  scope?: ProviderScope;
  dependencies?: (string | Constructor)[];
}

/**
 * Injection token interface
 */
export interface InjectionToken<T = any> {
  readonly description: string;
  toString(): string;
}

/**
 * Forward reference interface
 */
export interface ForwardReference<T = any> {
  forwardRef: () => Constructor<T>;
}