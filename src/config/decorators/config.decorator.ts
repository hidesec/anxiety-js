/**
 * Configuration decorators for the Anxiety framework
 */

import 'reflect-metadata';
import { ConfigService } from '../config.service';

// Metadata keys for configuration
export const CONFIG_SERVICE_METADATA = Symbol('CONFIG_SERVICE');
export const CONFIG_PROPERTY_METADATA = Symbol('CONFIG_PROPERTY');

/**
 * ConfigService decorator for injecting the configuration service
 * Usage: @ConfigService() private config: ConfigService
 */
export function InjectConfig(): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingTokens = Reflect.getMetadata('design:paramtypes', target) || [];
    existingTokens[parameterIndex] = ConfigService;
    Reflect.defineMetadata('design:paramtypes', existingTokens, target);
    Reflect.defineMetadata(CONFIG_SERVICE_METADATA, parameterIndex, target);
  };
}

/**
 * Config decorator for injecting specific configuration values
 * Usage: @Config('database.host') private dbHost: string
 */
export function Config(key?: string): ParameterDecorator & PropertyDecorator {
  return (target: any, propertyKey?: string | symbol, parameterIndex?: number) => {
    if (parameterIndex !== undefined) {
      // Parameter decorator
      const configKey = key || (propertyKey as string);
      Reflect.defineMetadata(CONFIG_PROPERTY_METADATA, { key: configKey, index: parameterIndex }, target);
    } else if (propertyKey) {
      // Property decorator
      const configKey = key || (propertyKey as string);
      
      Object.defineProperty(target, propertyKey, {
        get() {
          if (!this._configService) {
            throw new Error('ConfigService not injected. Make sure to use @InjectConfig() in constructor.');
          }
          return this._configService.get(configKey);
        },
        enumerable: true,
        configurable: true,
      });
    }
  };
}

/**
 * ConfigModule decorator for marking a class as a configuration module
 */
export function ConfigModule(options?: {
  envFilePath?: string | string[];
  ignoreEnvFile?: boolean;
  ignoreEnvVars?: boolean;
  global?: boolean;
}): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata('config_module_options', options || {}, target);
    Reflect.defineMetadata('is_config_module', true, target);
  };
}

/**
 * Configuration value decorator for property injection
 * Usage: @ConfigValue('app.port', 3000) private port: number
 */
export function ConfigValue(key: string, defaultValue?: any): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    let value: any;
    
    Object.defineProperty(target, propertyKey, {
      get() {
        if (value === undefined) {
          const configService = this._configService || (global as any).configService;
          if (!configService) {
            return defaultValue;
          }
          value = configService.get(key, defaultValue);
        }
        return value;
      },
      set(newValue: any) {
        value = newValue;
      },
      enumerable: true,
      configurable: true,
    });
  };
}

/**
 * Environment decorator for checking the current environment
 * Usage: @Environment('production') or @Environment(['development', 'test'])
 */
export function Environment(env: string | string[]): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const configService = (this as any)._configService || (global as any).configService;
      if (!configService) {
        throw new Error('ConfigService not available');
      }
      
      const currentEnv = configService.get('app.environment');
      const allowedEnvs = Array.isArray(env) ? env : [env];
      
      if (!allowedEnvs.includes(currentEnv)) {
        console.warn(`Method ${String(propertyKey)} is only available in environments: ${allowedEnvs.join(', ')}`);
        return;
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * ValidateConfig decorator for validating configuration at startup
 */
export function ValidateConfig(schema: unknown): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata('config_validation_schema', schema, target);
  };
}

/**
 * Utility function to get configuration metadata
 */
export function getConfigMetadata(target: any, key: string): any {
  return Reflect.getMetadata(key, target);
}

/**
 * Utility function to check if a class is a config module
 */
export function isConfigModule(target: any): boolean {
  return Reflect.getMetadata('is_config_module', target) === true;
}