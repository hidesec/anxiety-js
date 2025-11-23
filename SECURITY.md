# Security Policy

## 🔒 Security Features

Anxiety-JS framework includes built-in security validation to help prevent common security vulnerabilities related to configuration and secrets management.

## Automatic Security Validation

The framework automatically validates security-critical configuration values at application startup:

### JWT Secret Validation

- ✅ Checks if JWT_SECRET is set
- ✅ Validates secret length (minimum 32 characters in production)
- ✅ Detects weak/default secret values
- ✅ Identifies simple patterns (e.g., "12345", "aaaaa")
- ❌ **Blocks application startup in production** if validation fails

**Weak JWT secrets that are blocked:**
- `your-super-secret-jwt-key-change-this-in-production`
- `your-secret-key`
- `secret`
- `jwt-secret`
- `change-this`
- `default-secret`
- Any secret shorter than 32 characters (in production)

### Database Credentials Validation

- ✅ Checks for default usernames (postgres, admin, root)
- ✅ Validates password strength (minimum 12 characters)
- ✅ Detects weak/common passwords
- ❌ **Blocks application startup in production** if validation fails

**Weak database passwords that are blocked:**
- `postgres`
- `password`
- `admin`
- `12345`
- `root`
- Empty passwords
- Any password shorter than 12 characters (in production)

## Generating Secure Secrets

### Using Built-in Generator

The framework includes a built-in secret generator:

```bash
# Generate all types of secrets
npm run generate:secrets

# Generate only JWT secret
npm run generate:jwt
```

### Using Node.js Crypto

```bash
# Generate base64 encoded secret (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Generate hex encoded secret (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Using OpenSSL

```bash
# Generate base64 encoded secret
openssl rand -base64 64

# Generate hex encoded secret
openssl rand -hex 32
```

## Environment-Specific Behavior

### Development Environment

In development mode, the framework:
- ⚠️  Shows **warnings** for weak secrets but allows startup
- 🔄 Automatically generates a random JWT_SECRET if not provided
- 📝 Provides helpful instructions for generating secure secrets

### Production Environment

In production mode, the framework:
- ❌ **BLOCKS startup** if JWT_SECRET is not set or uses default values
- ❌ **BLOCKS startup** if database credentials are weak or default
- ⏱️  Gives 5-second delay if warnings are present (allows Ctrl+C to abort)
- 📋 Displays detailed error messages with remediation steps

## Security Best Practices

### 1. Secret Management

- ✅ **Generate unique secrets** for each environment (dev, staging, prod)
- ✅ **Use minimum 32 characters** for JWT secrets
- ✅ **Use minimum 12 characters** for database passwords
- ✅ **Use cryptographically random** secrets (not simple patterns)
- ❌ **Never commit** `.env` files to version control
- ❌ **Never share secrets** via email, chat, or insecure channels

### 2. Production Deployment

Before deploying to production:

1. Generate secure secrets:
   ```bash
   npm run generate:secrets
   ```

2. Copy the generated secrets to your `.env` file:
   ```bash
   JWT_SECRET=<generated-secret>
   DB_USERNAME=<unique-username>
   DB_PASSWORD=<strong-password>
   ```

3. Set environment to production:
   ```bash
   NODE_ENV=production
   ```

4. Test the application startup:
   ```bash
   npm start
   ```

### 3. Secret Storage

**Development:**
- Store in `.env` file (never commit)
- Add `.env` to `.gitignore`

**Production:**
- Use a secure secrets manager:
  - AWS Secrets Manager
  - Azure Key Vault
  - HashiCorp Vault
  - Google Cloud Secret Manager
- Use environment variables from your hosting platform
- Never hardcode secrets in source code

### 4. Secret Rotation

Rotate secrets regularly to minimize risk:

- **JWT secrets:** Every 90 days
- **Database passwords:** Every 90 days
- **API keys:** Every 90 days
- **After any security incident:** Immediately

### 5. Access Control

- Limit who has access to production secrets
- Use role-based access control (RBAC)
- Log all secret access and changes
- Use separate secrets for each environment

## Reporting Security Vulnerabilities

If you discover a security vulnerability in the Anxiety-JS framework:

1. **DO NOT** create a public GitHub issue
2. Email the maintainers directly at: [security@anxiety-framework.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Checklist

Before deploying to production, ensure:

- [ ] All secrets are generated using cryptographically secure methods
- [ ] JWT_SECRET is at least 32 characters long
- [ ] Database credentials are not using default values
- [ ] `.env` file is in `.gitignore`
- [ ] Production secrets are stored in a secure vault
- [ ] Security validation passes without warnings
- [ ] HTTPS is enabled for all external connections
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Security headers (Helmet) are enabled

## Additional Security Features

The framework also includes:

- 🛡️ **CORS protection** (configurable)
- 🔐 **Rate limiting** (configurable)
- 🪖 **Security headers** (Helmet integration)
- 🔒 **Bcrypt password hashing**
- 🎯 **Environment-based configuration**

## License

This security policy is part of the Anxiety-JS framework and is licensed under ISC License.

---

**Last Updated:** 2025-11-23

For more information, visit: https://github.com/hidesec/anxiety-js
