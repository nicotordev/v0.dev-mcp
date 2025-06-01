import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import 'dotenv/config';

// Mock V0_API_KEY if not provided
if (!process.env.V0_API_KEY) {
  process.env.V0_API_KEY = 'test-mock-key-12345';
}

// Global test setup
beforeAll(async () => {
  console.log('🚀 Setting up v0dev MCP Server tests...');
});

afterAll(async () => {
  console.log('✅ Cleaning up after tests...');
});

// Setup for each test
beforeEach(() => {
  // Reset any test-specific state
});

afterEach(() => {
  // Cleanup after each test
});
