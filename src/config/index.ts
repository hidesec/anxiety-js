/**
 * Configuration module exports
 */

// Core service and module
export * from './config.service';
export * from './config.module';

// Interfaces and types
export * from './interfaces/config.interface';

// Validation schemas
export * from './schemas/config.schema';

// Decorators
export {
  InjectConfig,
  Config,
  ConfigValue,
  Environment,
  ValidateConfig,
  getConfigMetadata,
  isConfigModule,
  CONFIG_SERVICE_METADATA,
  CONFIG_PROPERTY_METADATA
} from './decorators/config.decorator';