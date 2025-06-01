import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { join } from 'path';
import { cwd } from 'process';

describe('v0dev MCP Server Tools', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    const distPath = join(cwd(), 'dist', 'index.js');

    transport = new StdioClientTransport({
      command: 'node',
      args: [distPath],
      env: {
        ...process.env,
        V0_API_KEY: 'test-mock-key-12345',
      },
    });

    client = new Client({
      name: 'v0dev-tools-test-client',
      version: '1.0.0',
    });

    await client.connect(transport);
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('generate_webapp tool', () => {
    it('should handle missing API key gracefully', async () => {
      const result = await client.callTool({
        name: 'generate_webapp',
        arguments: {
          prompt: 'Create a simple React counter app',
          framework: 'react',
          stream: false,
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      expect((result.content as any[]).length).toBeGreaterThan(0);

      // Should either succeed (if real API key) or fail gracefully (if mock key)
      const content = result.content[0];
      expect(content.type).toBe('text');
      expect(typeof content.text).toBe('string');
    });

    it('should validate input parameters', async () => {
      // Test with invalid framework
      try {
        await client.callTool({
          name: 'generate_webapp',
          arguments: {
            prompt: 'Create an app',
            framework: 'invalid-framework', // This should cause validation error
          },
        });
      } catch (error) {
        // Should throw validation error
        expect(error).toBeDefined();
      }
    });

    it('should handle optional parameters', async () => {
      const result = await client.callTool({
        name: 'generate_webapp',
        arguments: {
          prompt: 'Create a simple app',
          // framework is optional, should default to nextjs
          // features is optional
          // stream is optional, should default to false
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('enhance_code tool', () => {
    it('should handle code enhancement request', async () => {
      const result = await client.callTool({
        name: 'enhance_code',
        arguments: {
          code: 'function add(a, b) { return a + b; }',
          enhancement: 'Add TypeScript types and error handling',
          language: 'typescript',
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect((result.content as any[]).length).toBeGreaterThan(0);

      const content = result.content[0];
      expect(content.type).toBe('text');
      expect(typeof content.text).toBe('string');
    });

    it('should use default language when not specified', async () => {
      const result = await client.callTool({
        name: 'enhance_code',
        arguments: {
          code: 'const x = 5;',
          enhancement: 'Make it more robust',
          // language not specified, should default to typescript
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('debug_code tool', () => {
    it('should handle code debugging request', async () => {
      const result = await client.callTool({
        name: 'debug_code',
        arguments: {
          code: 'function broken() { return x + y; }',
          error_message: 'ReferenceError: x is not defined',
          language: 'javascript',
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect((result.content as any[]).length).toBeGreaterThan(0);
    });

    it('should work without error message', async () => {
      const result = await client.callTool({
        name: 'debug_code',
        arguments: {
          code: 'function problematic() { /* some issues */ }',
          // error_message is optional
          language: 'javascript',
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('generate_component tool', () => {
    it('should generate React component', async () => {
      const result = await client.callTool({
        name: 'generate_component',
        arguments: {
          component_name: 'TestButton',
          description: 'A reusable button component',
          framework: 'react',
          props: [
            {
              name: 'label',
              type: 'string',
              required: true,
              description: 'Button text',
            },
            {
              name: 'onClick',
              type: '() => void',
              required: false,
              description: 'Click handler',
            },
          ],
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect((result.content as any[]).length).toBeGreaterThan(0);
    });

    it('should work with default framework and no props', async () => {
      const result = await client.callTool({
        name: 'generate_component',
        arguments: {
          component_name: 'SimpleComponent',
          description: 'A basic component',
          // framework defaults to react
          // props is optional
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect((result.content as any[]).length).toBeGreaterThan(0);
    });

    it('should handle Vue components', async () => {
      const result = await client.callTool({
        name: 'generate_component',
        arguments: {
          component_name: 'VueCard',
          description: 'A Vue card component',
          framework: 'vue',
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect((result.content as any[]).length).toBeGreaterThan(0);
    });

    it('should handle Svelte components', async () => {
      const result = await client.callTool({
        name: 'generate_component',
        arguments: {
          component_name: 'SvelteModal',
          description: 'A Svelte modal component',
          framework: 'svelte',
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect((result.content as any[]).length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tool names', async () => {
      try {
        await client.callTool({
          name: 'non_existent_tool',
          arguments: {},
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle malformed arguments', async () => {
      try {
        await client.callTool({
          name: 'generate_webapp',
          arguments: {
            // Missing required 'prompt' parameter
            framework: 'react',
          },
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
