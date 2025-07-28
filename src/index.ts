#!/usr/bin/env node

/**
 * v0-mcp-ts - Model Context Protocol Server
 * Entry point for the MCP server
 */

import { startServer } from './server/index.js';

// Start the server
startServer().catch((error) => {
  console.error('Failed to start v0-mcp-ts server:', error);
  process.exit(1);
});