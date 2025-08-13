// Setup file for Jest tests

// Set default timeout for tests
jest.setTimeout(30000);

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_SALT_ROUNDS = '10';
process.env.RATE_LIMIT_WINDOW = '15';
process.env.RATE_LIMIT_MAX = '100';
