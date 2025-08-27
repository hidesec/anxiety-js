/**
 * Application Constants
 */
export const APP_CONSTANTS = {
  // Framework Info
  FRAMEWORK_NAME: 'Anxiety Framework',
  VERSION: '1.0.0',
  
  // Default Configuration
  DEFAULT_PORT: 3000,
  DEFAULT_PREFIX: '/api',
  
  // Metadata Keys
  METADATA_KEYS: {
    CONTROLLER_PREFIX: 'controller_prefix',
    IS_CONTROLLER: 'is_controller',
    ROUTES: 'routes',
    MIDDLEWARE: 'anxiety_middleware',
    ROUTE_PARAMS: 'route_param_metadata'
  },

  // Request Context Keys
  CONTEXT_KEYS: {
    REQUEST_ID: 'requestId',
    START_TIME: 'startTime',
    AUTHENTICATED: 'authenticated',
    USER: 'user'
  },

  // Environment
  NODE_ENV: {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test'
  } as const
} as const;