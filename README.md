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
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm test           # Run tests
npm run lint       # Run ESLint
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