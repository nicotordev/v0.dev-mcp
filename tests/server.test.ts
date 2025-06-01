import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { cwd } from 'process';

describe('v0dev MCP Server', () => {
  let client: Client;
  let transport: StdioClientTransport;
  let serverProcess: ChildProcess | null = null;

  beforeAll(async () => {
    // Build the project first if dist doesn't exist
    const distPath = join(cwd(), 'dist', 'index.js');

    // Create transport to connect to the server
    transport = new StdioClientTransport({
      command: 'node',
      args: [distPath],
      env: {
        ...process.env,
        V0_API_KEY: process.env.V0_API_KEY || 'test-mock-key-12345',
      },
    });

    // Create client
    client = new Client({
      name: 'v0dev-test-client',
      version: '1.0.0',
    });

    // Connect to server
    await client.connect(transport);
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  describe('Server Initialization', () => {
    it('should connect successfully', () => {
      expect(client).toBeDefined();
    });

    it('should list available tools', async () => {
      const tools = await client.listTools();
      expect(tools.tools).toBeDefined();
      expect(tools.tools.length).toBeGreaterThan(0);

      const toolNames = tools.tools.map((tool) => tool.name);
      expect(toolNames).toContain('generate_webapp');
      expect(toolNames).toContain('enhance_code');
      expect(toolNames).toContain('debug_code');
      expect(toolNames).toContain('generate_component');
    });

    it('should list available resources', async () => {
      const resources = await client.listResources();
      expect(resources.resources).toBeDefined();
      expect(resources.resources.length).toBeGreaterThan(0);

      const resourceNames = resources.resources.map((r) => r.name);
      expect(resourceNames).toContain('v0-api-docs');
    });

    it('should list available prompts', async () => {
      const prompts = await client.listPrompts();
      expect(prompts.prompts).toBeDefined();
      expect(prompts.prompts.length).toBeGreaterThan(0);

      const promptNames = prompts.prompts.map((p) => p.name);
      expect(promptNames).toContain('create-webapp');
    });
  });

  describe('Resources', () => {
    it('should read v0-api-docs resource', async () => {
      const resource = await client.readResource({
        uri: 'v0://api-docs',
      });

      expect(resource.contents).toBeDefined();
      expect(resource.contents.length).toBeGreaterThan(0);
      expect(resource.contents[0].text).toBeDefined();
      expect(typeof resource.contents[0].text).toBe('string');
      expect((resource.contents[0].text as string).length).toBeGreaterThan(0);
    });
  });

  describe('Tool Schema Validation', () => {
    it('should have correct generate_webapp tool schema', async () => {
      const tools = await client.listTools();
      const generateWebapp = tools.tools.find(
        (t) => t.name === 'generate_webapp'
      );

      expect(generateWebapp).toBeDefined();
      expect(generateWebapp?.description).toBeDefined();
      expect(generateWebapp?.inputSchema).toBeDefined();
    });

    it('should have correct enhance_code tool schema', async () => {
      const tools = await client.listTools();
      const enhanceCode = tools.tools.find((t) => t.name === 'enhance_code');

      expect(enhanceCode).toBeDefined();
      expect(enhanceCode?.description).toBeDefined();
      expect(enhanceCode?.inputSchema).toBeDefined();
    });

    it('should have correct debug_code tool schema', async () => {
      const tools = await client.listTools();
      const debugCode = tools.tools.find((t) => t.name === 'debug_code');

      expect(debugCode).toBeDefined();
      expect(debugCode?.description).toBeDefined();
      expect(debugCode?.inputSchema).toBeDefined();
    });

    it('should have correct generate_component tool schema', async () => {
      const tools = await client.listTools();
      const generateComponent = tools.tools.find(
        (t) => t.name === 'generate_component'
      );

      expect(generateComponent).toBeDefined();
      expect(generateComponent?.description).toBeDefined();
      expect(generateComponent?.inputSchema).toBeDefined();
    });
  });
});
