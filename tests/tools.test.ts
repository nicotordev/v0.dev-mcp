import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { join } from 'path';
import { cwd } from 'process';

describe('v0.dev MCP Server Tools', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    const distPath = join(cwd(), 'dist', 'index.js');

    transport = new StdioClientTransport({
      command: 'node',
      args: [distPath],
      env: {
        ...process.env,
        // Use the actual V0_API_KEY from environment
      },
    });

    client = new Client({
      name: 'v0.dev-tools-test-client',
      version: '1.0.0',
    });

    await client.connect(transport);
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('generate_component tool', () => {
    it('should handle component generation request', async () => {
      const result = await client.callTool({
        name: 'generate_component',
        arguments: {
          component_name: 'TestButton',
          theme: 'modern blue theme with rounded corners',
          props: ['label', 'onClick', 'disabled'],
          styling: 'tailwind',
          stream: false,
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      expect((result.content as any[]).length).toBeGreaterThan(0);

      const content = result.content[0];
      expect(content.type).toBe('text');
      expect(typeof content.text).toBe('string');
    });

    it('should work with default parameters', async () => {
      const result = await client.callTool({
        name: 'generate_component',
        arguments: {
          component_name: 'SimpleCard',
          theme: 'minimalist design',
          // props is optional, defaults to []
          // styling is optional, defaults to tailwind
          // stream is optional, defaults to true
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should handle different styling systems', async () => {
      const result = await client.callTool({
        name: 'generate_component',
        arguments: {
          component_name: 'StyledButton',
          theme: 'modern dark theme',
          styling: 'styled-components',
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('refactor_component tool', () => {
    it('should handle component refactoring request', async () => {
      const result = await client.callTool({
        name: 'refactor_component',
        arguments: {
          code: `function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}`,
          improvements: ['Add TypeScript types', 'Add accessibility features'],
          target_framework: 'react',
          preserve_functionality: true,
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect((result.content as any[]).length).toBeGreaterThan(0);
    });

    it('should work with default parameters', async () => {
      const result = await client.callTool({
        name: 'refactor_component',
        arguments: {
          code: 'const Card = () => <div>Card</div>',
          improvements: ['Improve structure'],
          // target_framework defaults to react
          // preserve_functionality defaults to true
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('accessibility_auditor tool', () => {
    it('should audit HTML/JSX for accessibility issues', async () => {
      const result = await client.callTool({
        name: 'accessibility_auditor',
        arguments: {
          code: '<img src="logo.png" /><div onclick="doSomething()">Click me</div>',
          audit_level: 'comprehensive',
          framework: 'react',
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect((result.content as any[]).length).toBeGreaterThan(0);
    });

    it('should work with default audit level', async () => {
      const result = await client.callTool({
        name: 'accessibility_auditor',
        arguments: {
          code: '<button>Submit</button>',
          // audit_level defaults to comprehensive
          // framework defaults to react
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should handle different frameworks', async () => {
      const result = await client.callTool({
        name: 'accessibility_auditor',
        arguments: {
          code: '<div v-if="show">Content</div>',
          framework: 'vue',
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('shadcn_component_generator tool', () => {
    it('should generate shadcn/ui components', async () => {
      const result = await client.callTool({
        name: 'shadcn_component_generator',
        arguments: {
          component_type: 'data-table',
          shadcn_components: ['table', 'button', 'input'],
          features: ['sorting', 'filtering', 'pagination'],
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect((result.content as any[]).length).toBeGreaterThan(0);
    });

    it('should handle form components', async () => {
      const result = await client.callTool({
        name: 'shadcn_component_generator',
        arguments: {
          component_type: 'form',
          shadcn_components: ['form', 'input', 'button', 'label'],
          features: ['validation', 'error-handling'],
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('tailwind_layout_generator tool', () => {
    it('should generate Tailwind CSS layouts', async () => {
      const result = await client.callTool({
        name: 'tailwind_layout_generator',
        arguments: {
          layout_type: 'dashboard',
          sections: ['header', 'sidebar', 'main', 'footer'],
          responsive: true,
          dark_mode: true,
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect((result.content as any[]).length).toBeGreaterThan(0);
    });

    it('should handle simple layouts', async () => {
      const result = await client.callTool({
        name: 'tailwind_layout_generator',
        arguments: {
          layout_type: 'landing-page',
          sections: ['hero', 'features', 'cta'],
          // responsive defaults to true
          // dark_mode defaults to false
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('css_theme_generator tool', () => {
    it('should generate CSS custom property themes', async () => {
      const result = await client.callTool({
        name: 'css_theme_generator',
        arguments: {
          theme_name: 'Ocean Blue',
          primary_color: '#0066cc',
          secondary_color: '#00a86b',
          include_dark_variant: true,
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect((result.content as any[]).length).toBeGreaterThan(0);
    });

    it('should generate basic theme with primary color only', async () => {
      const result = await client.callTool({
        name: 'css_theme_generator',
        arguments: {
          theme_name: 'Simple Red',
          primary_color: '#ff0000',
          // secondary_color is optional
          // include_dark_variant defaults to false
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should generate Tailwind config themes', async () => {
      const result = await client.callTool({
        name: 'css_theme_generator',
        arguments: {
          theme_name: 'Corporate Theme',
          primary_color: '#1e40af',
          secondary_color: '#f59e0b',
          generate_tailwind_config: true,
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tool names', async () => {
      try {
        await client.callTool({
          name: 'non_existent_tool',
          arguments: {},
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle malformed arguments', async () => {
      try {
        await client.callTool({
          name: 'generate_component',
          arguments: {
            // Missing required 'component_name' and 'theme' parameters
            styling: 'tailwind',
          },
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid enum values', async () => {
      try {
        await client.callTool({
          name: 'generate_component',
          arguments: {
            component_name: 'TestComponent',
            theme: 'modern',
            styling: 'invalid-styling-system', // Invalid enum value
          },
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Tool Discovery', () => {
    it('should list all available tools', async () => {
      const tools = await client.listTools();
      
      expect(tools).toBeDefined();
      expect(tools.tools).toBeDefined();
      expect(Array.isArray(tools.tools)).toBe(true);
      
      const toolNames = tools.tools.map(tool => tool.name);
      expect(toolNames).toContain('generate_component');
      expect(toolNames).toContain('refactor_component');
      expect(toolNames).toContain('accessibility_auditor');
      expect(toolNames).toContain('shadcn_component_generator');
      expect(toolNames).toContain('tailwind_layout_generator');
      expect(toolNames).toContain('css_theme_generator');
    });

    it('should provide tool descriptions', async () => {
      const tools = await client.listTools();
      
      const componentGenerator = tools.tools.find(t => t.name === 'generate_component');
      expect(componentGenerator).toBeDefined();
      expect(componentGenerator?.description).toBeDefined();
      expect(componentGenerator?.description).toContain('Generate');
    });
  });
});