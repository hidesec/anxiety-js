import 'dotenv/config';
import { createApp } from './app';
import { SecurityValidator } from './config/validators/security.validator';

/**
 * Bootstrap the Anxiety application
 */
async function bootstrap() {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    const nodeEnv = process.env.NODE_ENV || 'development';
    const globalPrefix = process.env.GLOBAL_PREFIX || '/api';

    // ============================================
    // SECURITY VALIDATION
    // ============================================
    // Validate security configuration before starting the application
    const validationResult = SecurityValidator.validateSecurity(
      nodeEnv,
      process.env.JWT_SECRET,
      process.env.DB_USERNAME,
      process.env.DB_PASSWORD
    );

    // Print validation results
    SecurityValidator.printValidationResult(validationResult);

    // If validation failed in production, abort startup
    if (!validationResult.valid) {
      console.error('\n❌ Application startup aborted due to security validation failures.');

      // Print instructions for generating secure secrets
      SecurityValidator.printSecretGenerationInstructions();

      process.exit(1);
    }

    // If there are warnings in production, give user time to review
    if (nodeEnv === 'production' && validationResult.warnings.length > 0) {
      console.warn('\n⚠️  Starting in 5 seconds... Press Ctrl+C to abort if you need to fix security warnings.');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // ============================================
    // START APPLICATION
    // ============================================
    const app = createApp();

    app.listen(port, () => {
      console.log('\n🎉 Anxiety Framework application started successfully!');
      console.log(`🌍 Environment: ${nodeEnv}`);
      console.log(`📍 Global Prefix: ${globalPrefix}`);
      console.log(`🚀 Server running at: http://localhost:${port}\n`);
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