/**
 * Configuration module for the Anxiety framework
 */

import { ConfigService } from './config.service';
import { ConfigModuleOptions } from './interfaces/config.interface';

/**
 * ConfigModule provides configuration management for the framework
 */
export class ConfigModule {
  private static configService: ConfigService;

  /**
   * Create a ConfigModule for root application
   * @param options Configuration options
   */
  static forRoot(options: ConfigModuleOptions = {}): ConfigModuleForRoot {
    this.configService = new ConfigService(options);
    
    // Make config service globally available
    (global as any).configService = this.configService;

    return {
      module: ConfigModule,
      providers: [
        {
          provide: ConfigService,
          useValue: this.configService,
        },
      ],
      exports: [ConfigService],
      global: options.global !== false,
    };
  }

  /**
   * Create a ConfigModule for feature modules
   */
  static forFeature(): ConfigModuleForFeature {
    if (!this.configService) {
      throw new Error('ConfigModule.forRoot() must be called before forFeature()');
    }

    return {
      module: ConfigModule,
      providers: [
        {
          provide: ConfigService,
          useValue: this.configService,
        },
      ],
      exports: [ConfigService],
    };
  }

  /**
   * Get the current config service instance
   */
  static getConfigService(): ConfigService {
    if (!this.configService) {
      throw new Error('ConfigModule not initialized. Call ConfigModule.forRoot() first.');
    }
    return this.configService;
  }

  /**
   * Register configuration service in a container
   */
  static register(container: any): void {
    if (!this.configService) {
      this.configService = new ConfigService();
    }
    
    container.register('ConfigService', this.configService);
    (global as any).configService = this.configService;
  }

  /**
   * Initialize configuration for standalone usage
   */
  static initialize(options: ConfigModuleOptions = {}): ConfigService {
    this.configService = new ConfigService(options);
    (global as any).configService = this.configService;
    return this.configService;
  }
}

/**
 * Interface for ConfigModule.forRoot() return type
 */
export type ConfigModuleForRoot = {
  module: typeof ConfigModule;
  providers: any[];
  exports: any[];
  global: boolean;
}

/**
 * Interface for ConfigModule.forFeature() return type
 */
export type ConfigModuleForFeature = {
  module: typeof ConfigModule;
  providers: any[];
  exports: any[];
}

/**
 * Configuration provider factory
 */
export function createConfigProvider(options: ConfigModuleOptions = {}) {
  return {
    provide: ConfigService,
    useFactory: () => new ConfigService(options),
  };
}

/**
 * Configuration service factory for dependency injection
 */
export function configServiceFactory(options: ConfigModuleOptions = {}): ConfigService {
  return new ConfigService(options);
}

/**
 * Global configuration helper functions
 */
export class ConfigHelper {
  /**
   * Get configuration value from global config service
   */
  static get<T>(key: string): T | undefined;
  static get<T>(key: string, defaultValue: T): T;
  static get<T>(key: string, defaultValue?: T): T | undefined {
    const configService = (global as any).configService as ConfigService;
    if (!configService) {
      throw new Error('Global ConfigService not available. Initialize ConfigModule first.');
    }
    return configService.get(key, defaultValue);
  }

  /**
   * Check if configuration key exists
   */
  static has(key: string): boolean {
    const configService = (global as any).configService as ConfigService;
    if (!configService) {
      return false;
    }
    return configService.has(key);
  }

  /**
   * Get all configuration
   */
  static getAll(): Record<string, any> {
    const configService = (global as any).configService as ConfigService;
    if (!configService) {
      throw new Error('Global ConfigService not available. Initialize ConfigModule first.');
    }
    return configService.getAll();
  }

  /**
   * Get app configuration
   */
  static getAppConfig() {
    return this.get('app');
  }

  /**
   * Get database configuration
   */
  static getDatabaseConfig() {
    return this.get('database');
  }

  /**
   * Get security configuration
   */
  static getSecurityConfig() {
    return this.get('security');
  }

  /**
   * Get current environment
   */
  static getEnvironment(): string {
    return this.get('app.environment', 'development');
  }

  /**
   * Check if running in production
   */
  static isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  /**
   * Check if running in development
   */
  static isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  /**
   * Check if running in test
   */
  static isTest(): boolean {
    return this.getEnvironment() === 'test';
  }
}