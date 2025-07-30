#!/usr/bin/env node
/**
 * HTTP Server wrapper for Smithery Custom Deploy
 * Implements Streamable HTTP protocol requirements
 */

import { createServer } from 'node:http';
import { URL } from 'node:url';
import { EventEmitter } from 'node:events';

const PORT = process.env.PORT || 3000;

// Simple in-memory transport for MCP messages
class HttpMcpTransport extends EventEmitter {
  constructor() {
    super();
  }

  async start() {
    // Nothing to start for in-memory transport
  }

  async send(message: any) {
    // For this implementation, we'll handle messages synchronously
    return message;
  }

  close() {
    // Nothing to close
  }
}

// Parse query parameters into nested config object
function parseConfig(searchParams: URLSearchParams): Record<string, any> {
  const config: Record<string, any> = {};
  
  for (const [key, value] of searchParams.entries()) {
    // Handle special keys
    if (key === 'V0_API_KEY' || key === 'v0ApiKey') {
      process.env.V0_API_KEY = value;
      config.V0_API_KEY = value;
      continue;
    }
    
    if (key === 'DEBUG') {
      process.env.DEBUG = value;
      config.DEBUG = value === 'true';
      continue;
    }
    
    if (key === 'LOG_LEVEL') {
      process.env.LOG_LEVEL = value;
      config.LOG_LEVEL = value;
      continue;
    }
    
    // Handle dot notation for nested configs
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

// Create MCP server instance
let mcpServer: any = null;

async function getMcpServer() {
  if (!mcpServer) {
    try {
      const { server } = await import('./server/index.js');
      mcpServer = server;
      
      // Connect with HTTP transport
      const transport = new HttpMcpTransport();
      await mcpServer.connect(transport);
    } catch (error) {
      console.error('Failed to load MCP server:', error);
      throw error;
    }
  }
  return mcpServer;
}

// Handle MCP list_tools request for lazy loading
async function handleListTools(): Promise<any> {
  try {
    // Initialize MCP server (but don't use the return value in this simplified implementation)
    await getMcpServer();
    
    // Simulate list_tools request
    const request = {
      jsonrpc: '2.0' as const,
      id: 'list_tools_' + Date.now(),
      method: 'tools/list' as const,
      params: {}
    };
    
    // Get tools from server (this is a simplified approach)
    // In a real implementation, you'd properly handle the MCP protocol
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        tools: [
          {
            name: 'component_generator',
            description: 'Generate React components with v0.dev AI integration'
          },
          {
            name: 'accessibility_auditor', 
            description: 'Audit components for accessibility compliance'
          },
          {
            name: 'shadcn_component_generator',
            description: 'Generate shadcn/ui components'
          },
          {
            name: 'tailwind_layout_generator',
            description: 'Generate Tailwind CSS layouts'
          },
          {
            name: 'css_theme_generator',
            description: 'Generate CSS themes and design systems'
          },
          {
            name: 'component_refactor',
            description: 'Refactor and optimize React components'
          }
        ]
      }
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id: 'error',
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
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
      
      // Handle different HTTP methods
      if (req.method === 'GET') {
        // Return proper MCP server info for tool discovery
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          protocolVersion: '2024-11-05',
          capabilities: {
            logging: {},
            prompts: {
              listChanged: true
            },
            resources: {
              subscribe: true,
              listChanged: true
            },
            tools: {
              listChanged: true
            }
          },
          serverInfo: {
            name: 'v0-mcp-ts',
            version: '2.0.0',
            description: 'MCP server for v0.dev AI integration'
          },
          tools: [
            {
              name: 'component_generator',
              description: 'Generate React components with v0.dev AI integration',
              inputSchema: {
                type: 'object',
                properties: {
                  component_name: { type: 'string', description: 'Name of the component to generate' },
                  component_description: { type: 'string', description: 'Description of what the component should do' }
                },
                required: ['component_name', 'component_description']
              }
            },
            {
              name: 'accessibility_auditor',
              description: 'Audit components for accessibility compliance',
              inputSchema: {
                type: 'object',
                properties: {
                  component_code: { type: 'string', description: 'React component code to audit' }
                },
                required: ['component_code']
              }
            },
            {
              name: 'shadcn_component_generator',
              description: 'Generate shadcn/ui components',
              inputSchema: {
                type: 'object',
                properties: {
                  component_type: { type: 'string', description: 'Type of shadcn component to generate' },
                  customization: { type: 'string', description: 'Customization requirements' }
                },
                required: ['component_type']
              }
            },
            {
              name: 'tailwind_layout_generator',
              description: 'Generate Tailwind CSS layouts',
              inputSchema: {
                type: 'object',
                properties: {
                  layout_type: { type: 'string', description: 'Type of layout to generate' },
                  requirements: { type: 'string', description: 'Layout requirements and specifications' }
                },
                required: ['layout_type', 'requirements']
              }
            },
            {
              name: 'css_theme_generator',
              description: 'Generate CSS themes and design systems',
              inputSchema: {
                type: 'object',
                properties: {
                  theme_name: { type: 'string', description: 'Name of the theme' },
                  color_palette: { type: 'string', description: 'Primary colors for the theme' }
                },
                required: ['theme_name']
              }
            },
            {
              name: 'component_refactor',
              description: 'Refactor and optimize React components',
              inputSchema: {
                type: 'object',
                properties: {
                  component_code: { type: 'string', description: 'React component code to refactor' },
                  optimization_goals: { type: 'string', description: 'What to optimize for (performance, accessibility, etc.)' }
                },
                required: ['component_code']
              }
            }
          ]
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
            
            // Validate API key for actual tool usage
            if (mcpRequest.method && mcpRequest.method.startsWith('tools/call') && !process.env.V0_API_KEY) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                jsonrpc: '2.0',
                id: mcpRequest.id,
                error: {
                  code: -32602,
                  message: 'V0_API_KEY is required for tool execution'
                }
              }));
              return;
            }
            
            // Handle list_tools specially for lazy loading
            if (mcpRequest.method === 'tools/list') {
              const result = await handleListTools();
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
              return;
            }
            
            // For other requests, return a basic success response
            // In a full implementation, you'd properly route to the MCP server
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              jsonrpc: '2.0',
              id: mcpRequest.id,
              result: { 
                message: 'MCP request received',
                method: mcpRequest.method,
                note: 'This is a simplified HTTP bridge implementation'
              }
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
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
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