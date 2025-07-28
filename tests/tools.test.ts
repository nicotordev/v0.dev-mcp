import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { join } from 'path';
import { cwd } from 'process';

describe('MCP Tools Core Tests', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    transport = new StdioClientTransport({
      command: 'node',
      args: [join(cwd(), 'dist', 'index.js')],
      env: { ...process.env, V0_API_KEY: 'test-mock-key-12345' },
    });

    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    });

    await client.connect(transport);
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it('should list tools', async () => {
    const result = await client.listTools();
    expect(result.tools.length).toBe(6);
    expect(result.tools.map(t => t.name)).toContain('generate_component');
  }, 3000);

  it('should list prompts', async () => {
    const result = await client.listPrompts();
    expect(result.prompts.length).toBe(7);
    expect(result.prompts.map(p => p.name)).toContain('generate-component');
  }, 3000);

  it('should list resources', async () => {
    const result = await client.listResources();
    expect(result.resources.length).toBe(2);
    expect(result.resources.map(r => r.name)).toContain('v0-api-docs');
  }, 3000);

  // Test component generation with mock API key (will fail gracefully)
  it('should handle component generation request', async () => {
    try {
      const result = await client.callTool({
        name: 'generate_component',
        arguments: {
          component_name: 'TestButton',
          theme: 'simple blue',
          styling: 'tailwind',
          stream: false,
        },
      });
      // If successful, check structure
      expect(result.content).toBeDefined();
    } catch (error) {
      // Expected with mock API key - check error is API related
      expect(error.message).toContain('Unauthorized');
    }
  }, 5000);
});