import 'reflect-metadata';
import { createAnxietyApp } from './core/application/anxiety-application';
import { AppModule } from './modules/app.module';

/**
 * Create and configure the Anxiety application
 */
export function createApp() {
  const app = createAnxietyApp({
    bodyParser: process.env.BODY_PARSER_ENABLED !== 'false',
    cors: process.env.CORS_ENABLED !== 'false',
    port: parseInt(process.env.PORT || '3001', 10),
    globalPrefix: process.env.GLOBAL_PREFIX || '/api'
  });

  // Register all controllers from the app module
  const controllers = AppModule.getAllControllers();
  app.registerControllers(controllers);

  // Initialize the application
  app.init();

  return app;
}