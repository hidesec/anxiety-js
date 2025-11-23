/**
 * Security validator for configuration
 * Validates that sensitive configuration values are not using weak/default values
 */

import chalk from 'chalk';

/**
 * List of weak/default JWT secrets that should never be used
 */
const WEAK_JWT_SECRETS = [
  'your-super-secret-jwt-key-change-this-in-production',
  'your-secret-key',
  'secret',
  'jwt-secret',
  'change-this',
  'default-secret',
  'test-secret',
  '12345',
  'password',
  'admin',
];

/**
 * List of weak/default database passwords
 */
const WEAK_DB_PASSWORDS = [
  'postgres',
  'password',
  'admin',
  '12345',
  'root',
  'test',
  '',
];

/**
 * List of weak/default database usernames
 */
const WEAK_DB_USERNAMES = [
  'postgres',
  'admin',
  'root',
  'test',
];

/**
 * Security validation result
 */
export interface SecurityValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration security validator
 */
export class SecurityValidator {
  /**
   * Validate all security-related configuration
   */
  static validateSecurity(
    environment: string,
    jwtSecret?: string,
    dbUsername?: string,
    dbPassword?: string
  ): SecurityValidationResult {
    const result: SecurityValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Validate JWT secret
    this.validateJwtSecret(environment, jwtSecret, result);

    // Validate database credentials
    this.validateDatabaseCredentials(environment, dbUsername, dbPassword, result);

    return result;
  }

  /**
   * Validate JWT secret strength
   */
  private static validateJwtSecret(
    environment: string,
    jwtSecret: string | undefined,
    result: SecurityValidationResult
  ): void {
    if (!jwtSecret) {
      if (environment === 'production') {
        result.valid = false;
        result.errors.push(
          '❌ CRITICAL: JWT_SECRET is not set! This is a security vulnerability.'
        );
      } else {
        result.warnings.push(
          '⚠️  WARNING: JWT_SECRET is not set. A random secret will be generated for this session.'
        );
      }
      return;
    }

    // Check if JWT secret is in the weak secrets list
    if (WEAK_JWT_SECRETS.includes(jwtSecret.toLowerCase())) {
      if (environment === 'production') {
        result.valid = false;
        result.errors.push(
          `❌ CRITICAL: JWT_SECRET is using a weak/default value: "${jwtSecret}"\n` +
          '   This is a SEVERE security vulnerability! Change it immediately!'
        );
      } else {
        result.warnings.push(
          `⚠️  WARNING: JWT_SECRET is using a weak/default value: "${jwtSecret}"\n` +
          '   Please change this before deploying to production.'
        );
      }
    }

    // Check JWT secret length
    if (jwtSecret.length < 32) {
      if (environment === 'production') {
        result.valid = false;
        result.errors.push(
          `❌ CRITICAL: JWT_SECRET is too short (${jwtSecret.length} characters).\n` +
          '   Minimum recommended length is 32 characters for production.'
        );
      } else {
        result.warnings.push(
          `⚠️  WARNING: JWT_SECRET is short (${jwtSecret.length} characters).\n` +
          '   Recommended minimum length is 32 characters.'
        );
      }
    }

    // Check if JWT secret contains only simple patterns
    if (this.isSimplePattern(jwtSecret)) {
      result.warnings.push(
        '⚠️  WARNING: JWT_SECRET appears to use a simple pattern.\n' +
        '   Consider using a cryptographically random string.'
      );
    }
  }

  /**
   * Validate database credentials
   */
  private static validateDatabaseCredentials(
    environment: string,
    dbUsername: string | undefined,
    dbPassword: string | undefined,
    result: SecurityValidationResult
  ): void {
    // Check username
    if (dbUsername && WEAK_DB_USERNAMES.includes(dbUsername.toLowerCase())) {
      if (environment === 'production') {
        result.valid = false;
        result.errors.push(
          `❌ CRITICAL: Database username is using default value: "${dbUsername}"\n` +
          '   This is a security risk! Use a custom username in production.'
        );
      } else {
        result.warnings.push(
          `⚠️  WARNING: Database username is using default value: "${dbUsername}"\n` +
          '   Consider using a custom username.'
        );
      }
    }

    // Check password
    if (!dbPassword) {
      if (environment === 'production') {
        result.valid = false;
        result.errors.push(
          '❌ CRITICAL: Database password is not set!\n' +
          '   This is a SEVERE security vulnerability!'
        );
      }
    } else if (WEAK_DB_PASSWORDS.includes(dbPassword.toLowerCase())) {
      if (environment === 'production') {
        result.valid = false;
        result.errors.push(
          `❌ CRITICAL: Database password is using weak/default value: "${dbPassword}"\n` +
          '   This is a SEVERE security vulnerability! Change it immediately!'
        );
      } else {
        result.warnings.push(
          `⚠️  WARNING: Database password is using weak/default value: "${dbPassword}"\n` +
          '   Please change this before deploying to production.'
        );
      }
    } else if (dbPassword.length < 12) {
      if (environment === 'production') {
        result.errors.push(
          `❌ CRITICAL: Database password is too short (${dbPassword.length} characters).\n` +
          '   Minimum recommended length is 12 characters for production.'
        );
      } else {
        result.warnings.push(
          `⚠️  WARNING: Database password is short (${dbPassword.length} characters).\n` +
          '   Recommended minimum length is 12 characters.'
        );
      }
    }
  }

  /**
   * Check if a string is a simple pattern (e.g., "12345", "aaaaa")
   */
  private static isSimplePattern(value: string): boolean {
    // Check for repeating characters
    if (/^(.)\1+$/.test(value)) {
      return true;
    }

    // Check for sequential numbers
    if (/^(0123456789|123456789|987654321)/.test(value)) {
      return true;
    }

    // Check for sequential letters
    if (/^(abcdefghijklmnopqrstuvwxyz|ABCDEFGHIJKLMNOPQRSTUVWXYZ)/.test(value)) {
      return true;
    }

    return false;
  }

  /**
   * Print validation result to console
   */
  static printValidationResult(result: SecurityValidationResult): void {
    if (result.errors.length > 0) {
      console.error(chalk.red('\n🔒 SECURITY VALIDATION FAILED!\n'));
      result.errors.forEach(error => {
        console.error(chalk.red(error));
      });
      console.error(chalk.red('\n⚠️  Application startup aborted due to security issues.\n'));
    }

    if (result.warnings.length > 0) {
      console.warn(chalk.yellow('\n🔒 Security Warnings:\n'));
      result.warnings.forEach(warning => {
        console.warn(chalk.yellow(warning));
      });
      console.warn(chalk.yellow(''));
    }

    if (result.valid && result.warnings.length === 0) {
      console.log(chalk.green('✅ Security validation passed!'));
    }
  }

  /**
   * Generate a secure random secret
   */
  static generateSecureSecret(length: number = 64): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let secret = '';

    // Use crypto.randomBytes if available, otherwise fallback to Math.random
    try {
      const crypto = require('crypto');
      const randomBytes = crypto.randomBytes(length);

      for (let i = 0; i < length; i++) {
        secret += charset[randomBytes[i] % charset.length];
      }
    } catch (error) {
      // Fallback to Math.random (less secure, but better than nothing)
      for (let i = 0; i < length; i++) {
        secret += charset[Math.floor(Math.random() * charset.length)];
      }
    }

    return secret;
  }

  /**
   * Print instructions for generating secure secrets
   */
  static printSecretGenerationInstructions(): void {
    console.log(chalk.cyan('\n📝 How to generate secure secrets:\n'));
    console.log(chalk.white('1. Generate a random JWT secret:'));
    console.log(chalk.gray('   node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'base64\'))"'));
    console.log(chalk.white('\n2. Or use this generated secret:'));
    console.log(chalk.green(`   JWT_SECRET=${this.generateSecureSecret()}`));
    console.log(chalk.white('\n3. Add it to your .env file and restart the application.\n'));
  }
}
