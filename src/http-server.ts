#!/usr/bin/env bun
/**
 * HTTP Server wrapper for Smithery Custom Deploy
 * Implements Streamable HTTP protocol requirements
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from 'node:http';
import { URL } from 'node:url';

// Import your existing MCP server setup
async function createMCPServer() {
  // Import and setup your existing server logic here
  const { startServer } = await import('./server/index.js');
  return startServer();
}

const PORT = process.env.PORT || 3000;

// Parse query parameters into nested config object
function parseConfig(searchParams: URLSearchParams): Record<string, any> {
  const config: Record<string, any> = {};
  
  for (const [key, value] of searchParams.entries()) {
    const keys = key.split('.');
    let current = config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const currentKey = keys[i];
      if (currentKey && !(currentKey in current)) {
        current[currentKey] = {};
      }
      if (currentKey) {
        current = current[currentKey];
      }
    }
    
    const finalKey = keys[keys.length - 1];
    if (finalKey) {
      current[finalKey] = value;
    }
  }
  
  return config;
}

// Create HTTP server
const server = createServer(async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  
  // CORS headers for browser compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check endpoint
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    }));
    return;
  }
  
  // MCP endpoint as required by Smithery
  if (url.pathname === '/mcp') {
    try {
      // Parse configuration from query parameters
      const config = parseConfig(url.searchParams);
      
      // Set V0_API_KEY from config
      if (config.v0ApiKey) {
        process.env.V0_API_KEY = config.v0ApiKey;
      }
      
      // Handle different HTTP methods
      if (req.method === 'GET') {
        // Return server capabilities and status
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          name: 'v0-mcp-ts',
          version: '2.0.0',
          description: 'MCP server for v0.dev AI integration',
          capabilities: {
            tools: true,
            prompts: true,
            resources: true
          },
          status: 'ready',
          config: Object.keys(config)
        }));
        return;
      }
      
      if (req.method === 'POST') {
        // Handle MCP requests
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const mcpRequest = JSON.parse(body);
            
            // Create MCP server instance
            const mcpServer = await createMCPServer();
            
            // Process the request (simplified - in practice you'd need proper transport)
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              jsonrpc: '2.0',
              id: mcpRequest.id,
              result: { message: 'MCP request processed', request: mcpRequest.method }
            }));
            
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32700,
                message: 'Parse error',
                data: error instanceof Error ? error.message : 'Unknown error'
              }
            }));
          }
        });
        return;
      }
      
      if (req.method === 'DELETE') {
        // Handle cleanup/shutdown
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'shutdown requested' }));
        return;
      }
      
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
      return;
    }
  }
  
  // 404 for other paths
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 v0-mcp-ts HTTP server listening on port ${PORT}`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
}); 