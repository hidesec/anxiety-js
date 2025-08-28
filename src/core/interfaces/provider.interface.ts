/**
 * Provider and dependency injection interfaces for the Anxiety Framework
 */

import { Constructor } from '../../shared/types';

/**
 * Provider interface
 */
export type Provider<T = any> = {
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
export type ClassProvider<T = any> = {
  provide: string | Constructor<T>;
  useClass: Constructor<T>;
}

/**
 * Value provider interface
 */
export type ValueProvider<T = any> = {
  provide: string | Constructor<T>;
  useValue: T;
}

/**
 * Factory provider interface
 */
export type FactoryProvider<T = any> = {
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
export type InjectableMetadata = {
  scope?: ProviderScope;
  dependencies?: (string | Constructor)[];
}

/**
 * Injection token interface
 */
export type InjectionToken<T = any> = {
  readonly description: string;
  toString(): string;
}

/**
 * Forward reference interface
 */
export type ForwardReference<T = any> = {
  forwardRef: () => Constructor<T>;
}