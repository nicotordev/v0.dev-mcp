import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000, // 30 seconds for MCP server tests
    hookTimeout: 10000,
    teardownTimeout: 10000,
  },
  esbuild: {
    target: 'esnext',
  },
});
