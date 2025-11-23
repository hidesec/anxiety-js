#!/usr/bin/env node

/**
 * Utility script to generate secure random secrets for the Anxiety framework
 *
 * Usage:
 *   node scripts/generate-secrets.js
 *   node scripts/generate-secrets.js --jwt
 *   node scripts/generate-secrets.js --all
 */

const crypto = require('crypto');
const chalk = require('chalk');

/**
 * Generate a secure random string
 */
function generateSecureSecret(length = 64, charset = null) {
  const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const chars = charset || defaultCharset;
  let secret = '';

  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    secret += chars[randomBytes[i] % chars.length];
  }

  return secret;
}

/**
 * Generate a base64 encoded secret
 */
function generateBase64Secret(byteLength = 64) {
  return crypto.randomBytes(byteLength).toString('base64');
}

/**
 * Generate a hex encoded secret
 */
function generateHexSecret(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const showJwtOnly = args.includes('--jwt');
  const showAll = args.includes('--all') || args.length === 0;

  console.log(chalk.cyan('\n🔐 Secure Secret Generator for Anxiety Framework\n'));
  console.log(chalk.gray('='.repeat(60)));

  if (showAll || showJwtOnly) {
    console.log(chalk.white('\n1. JWT Secret (Base64, 64 bytes):'));
    console.log(chalk.green(`   JWT_SECRET=${generateBase64Secret(64)}`));

    console.log(chalk.white('\n2. JWT Secret (Hex, 32 bytes):'));
    console.log(chalk.green(`   JWT_SECRET=${generateHexSecret(32)}`));

    console.log(chalk.white('\n3. JWT Secret (Random chars, 64 characters):'));
    console.log(chalk.green(`   JWT_SECRET=${generateSecureSecret(64)}`));
  }

  if (showAll) {
    console.log(chalk.white('\n4. Database Password (alphanumeric + symbols, 32 characters):'));
    console.log(chalk.green(`   DB_PASSWORD=${generateSecureSecret(32)}`));

    console.log(chalk.white('\n5. API Key (hex, 32 bytes):'));
    console.log(chalk.green(`   API_KEY=${generateHexSecret(32)}`));

    console.log(chalk.white('\n6. Session Secret (base64, 32 bytes):'));
    console.log(chalk.green(`   SESSION_SECRET=${generateBase64Secret(32)}`));

    console.log(chalk.white('\n7. Encryption Key (hex, 32 bytes for AES-256):'));
    console.log(chalk.green(`   ENCRYPTION_KEY=${generateHexSecret(32)}`));
  }

  console.log(chalk.gray('\n' + '='.repeat(60)));
  console.log(chalk.yellow('\n📝 Instructions:'));
  console.log(chalk.white('1. Copy one of the generated secrets above'));
  console.log(chalk.white('2. Add it to your .env file'));
  console.log(chalk.white('3. Never commit .env file to version control'));
  console.log(chalk.white('4. Use different secrets for each environment (dev, staging, prod)'));

  console.log(chalk.yellow('\n⚠️  Security Tips:'));
  console.log(chalk.white('• Store production secrets in a secure vault (e.g., AWS Secrets Manager)'));
  console.log(chalk.white('• Rotate secrets regularly (at least every 90 days)'));
  console.log(chalk.white('• Never share secrets via email or chat'));
  console.log(chalk.white('• Use different secrets for different environments'));
  console.log(chalk.white('• Keep a secure backup of your secrets\n'));

  console.log(chalk.cyan('Options:'));
  console.log(chalk.gray('  --jwt   Generate only JWT secrets'));
  console.log(chalk.gray('  --all   Generate all types of secrets (default)\n'));
}

// Run the script
main();
