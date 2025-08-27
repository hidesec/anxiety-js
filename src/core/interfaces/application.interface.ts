/**
 * Core application interfaces for the Anxiety Framework
 */

import { Constructor } from '../../shared/types';

/**
 * Application module interface
 */
export interface ApplicationModule {
  imports?: Constructor[];
  controllers?: Constructor[];
  services?: Constructor[];
  middlewares?: Constructor[];
  exports?: Constructor[];
}

/**
 * Module metadata interface
 */
export interface ModuleMetadata {
  imports?: Constructor[];
  controllers?: Constructor[];
  providers?: Constructor[];
  exports?: Constructor[];
}

/**
 * Dependency injection container interface
 */
export interface DIContainer {
  register<T>(token: string | Constructor<T>, implementation: Constructor<T>): void;
  resolve<T>(token: string | Constructor<T>): T;
  has(token: string | Constructor): boolean;
  clear(): void;
}

/**
 * Application context interface
 */
export interface ApplicationContext {
  get<T>(token: string | Constructor<T>): T;
  resolve<T>(token: string | Constructor<T>): Promise<T>;
  registerModule(module: ApplicationModule): void;
  getModules(): ApplicationModule[];
}

/**
 * Lifecycle hook interfaces
 */
export interface OnModuleInit {
  onModuleInit(): void | Promise<void>;
}

export interface OnModuleDestroy {
  onModuleDestroy(): void | Promise<void>;
}

export interface OnApplicationBootstrap {
  onApplicationBootstrap(): void | Promise<void>;
}

export interface OnApplicationShutdown {
  onApplicationShutdown(signal?: string): void | Promise<void>;
}