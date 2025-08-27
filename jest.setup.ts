/**
 * Jest setup file to configure test environment
 */

// Set NODE_ENV to test to suppress route registration logs
process.env.NODE_ENV = 'test';

// Suppress console.log during tests to reduce noise
const originalConsoleLog = console.log;
const originalConsoleDebug = console.debug;
const originalConsoleInfo = console.info;

// Override console methods to suppress output during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn, // Keep warnings
  error: console.error, // Keep errors
};

// Add global cleanup to prevent process leaks
beforeEach(() => {
  // Clear all timers before each test
  jest.clearAllTimers();
  jest.clearAllMocks();
});

afterEach(async () => {
  // Clean up any remaining timers or handles
  jest.clearAllTimers();
  jest.clearAllMocks();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  // Add small delay to allow cleanup
  await new Promise(resolve => setTimeout(resolve, 10));
});

afterAll(async () => {
  // Final cleanup
  jest.clearAllTimers();
  jest.clearAllMocks();
  
  // Remove all listeners
  process.removeAllListeners('uncaughtException');
  process.removeAllListeners('unhandledRejection');
  
  // Add delay for cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Ensure clean exit
process.on('exit', () => {
  process.removeAllListeners();
});