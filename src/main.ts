import 'dotenv/config';
import { createApp } from './app';

/**
 * Bootstrap the Anxiety application
 */
async function bootstrap() {
  try {
    const app = createApp();
    
    const port = parseInt(process.env.PORT || '3001', 10);
    const nodeEnv = process.env.NODE_ENV || 'development';
    const globalPrefix = process.env.GLOBAL_PREFIX || '/api';
    
    app.listen(port, () => {
      console.log('🎉 Anxiety Framework application started successfully!');
      console.log(`🌍 Environment: ${nodeEnv}`);
      console.log(`📍 Global Prefix: ${globalPrefix}`);
      console.log(`🚀 Server running at: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap().catch((error) => {
  console.error('❌ Error starting application:', error);
  process.exit(1);
});