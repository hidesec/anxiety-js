# Anxiety-JS Framework

A lightweight, decorator-based backend framework for Node.js, built with TypeScript. Inspired by NestJS and Spring Boot patterns.

## Features

- 🎯 **Decorator-based routing** - Clean and intuitive route definitions
- 🔧 **Modular architecture** - Organized code structure with modules
- 🛡️ **Built-in middleware** - Authentication, logging, and more
- 🔄 **Dependency injection** - Service-oriented architecture
- 🧪 **Testing support** - Comprehensive unit and integration testing
- ⚡ **TypeScript-first** - Full type safety and modern syntax
- 🌍 **Environment configuration** - Comprehensive .env support

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/hidesec/anxiety-js.git
cd anxiety-js

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

### Basic Usage

```typescript
import { Controller, Get, Post } from 'anxiety-js';

@Controller('/api/users')
export class UserController {
  @Get()
  getAllUsers() {
    return { message: 'All users' };
  }

  @Post()
  createUser(@Body() userData: any) {
    return { message: 'User created', data: userData };
  }
}
```

## Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm test                 # Run tests
npm run lint             # Run ESLint
npm run generate:secrets # Generate secure random secrets
npm run generate:jwt     # Generate JWT secret only
```

## Environment Configuration

The framework supports comprehensive environment configuration through `.env` files:

```bash
# Application Settings
NODE_ENV=development
PORT=3001
GLOBAL_PREFIX=/api

# Server Configuration
CORS_ENABLED=true
BODY_PARSER_ENABLED=true

# Security
JWT_SECRET=your-secret-key
API_RATE_LIMIT_ENABLED=true

# And many more...
```

### 🔒 Security Configuration

**IMPORTANT:** The framework includes built-in security validation to protect against weak secrets and default credentials.

#### Generating Secure Secrets

Before running in production, generate secure secrets:

```bash
# Generate all types of secrets
npm run generate:secrets

# Generate only JWT secret
npm run generate:jwt

# Or use openssl
openssl rand -base64 64
```

#### Security Validation

The application automatically validates:
- ✅ JWT secret strength (minimum 32 characters)
- ✅ Database credentials (no default values)
- ✅ Prevention of weak/common passwords
- ✅ Environment-specific security checks

**In production mode**, the application will **refuse to start** if:
- JWT_SECRET is not set or uses a default value
- Database credentials use default/weak values
- Secrets are too short or use simple patterns

#### Security Best Practices

1. **Never use default secrets in production**
2. **Generate unique secrets for each environment**
3. **Store production secrets in a secure vault**
4. **Rotate secrets regularly (every 90 days)**
5. **Never commit `.env` files to version control**

## Project Structure

```
src/
├── core/                 # Framework core components
│   ├── application/      # Application factory
│   ├── decorators/       # Core decorators
│   ├── interfaces/       # Core interfaces
│   └── router/          # Routing engine
├── http/                # HTTP decorators and utilities
├── middleware/          # Built-in and custom middleware
├── modules/             # Application modules
├── common/              # Shared utilities and decorators
├── shared/              # Constants, enums, and types
└── __tests__/           # Test suites
```

## Testing

The framework includes comprehensive testing setup:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC License - see the [LICENSE](LICENSE) file for details.

## Links

- [GitHub Repository](https://github.com/hidesec/anxiety-js)
- [Issues](https://github.com/hidesec/anxiety-js/issues)

---

**Anxiety-JS** - Making backend development less anxious, one decorator at a time! 🚀