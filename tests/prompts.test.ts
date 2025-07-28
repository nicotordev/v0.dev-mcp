import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { join } from 'path';
import { cwd } from 'process';

describe('v0.dev MCP Server Prompts', () => {
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
      name: 'v0.dev-prompts-test-client',
      version: '1.0.0',
    });

    await client.connect(transport);
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('audit-accessibility prompt', () => {
    it('should generate accessibility audit prompt', async () => {
      const prompt = await client.getPrompt({
        name: 'audit-accessibility',
        arguments: {
          code: '<img src="test.jpg" />',
          audit_level: 'comprehensive',
          framework: 'react',
          focus_areas: 'all',
          include_fixes: 'true',
          severity_filter: 'all',
        },
      });

      expect(prompt).toBeDefined();
      expect(prompt.messages).toBeDefined();
      expect(Array.isArray(prompt.messages)).toBe(true);
      expect(prompt.messages.length).toBeGreaterThan(0);
      expect(prompt.messages[0].role).toBe('user');
      expect(prompt.messages[0].content.type).toBe('text');
      expect(prompt.messages[0].content.text).toContain('accessibility');
    });

    it('should work with minimal arguments', async () => {
      const prompt = await client.getPrompt({
        name: 'audit-accessibility',
        arguments: {
          code: '<button>Click</button>',
        },
      });

      expect(prompt).toBeDefined();
      expect(prompt.messages).toBeDefined();
      expect(prompt.messages[0].content.text).toContain('comprehensive'); // default audit level
    });
  });

  describe('generate-component prompt', () => {
    it('should generate component generation prompt', async () => {
      const prompt = await client.getPrompt({
        name: 'generate-component',
        arguments: {
          component_name: 'TestButton',
          component_description: 'A reusable button component',
          theme: 'modern blue',
          styling_system: 'tailwind',
          required_props: 'label,onClick',
          optional_props: 'disabled,variant',
          features: 'hover-effects,focus-states',
        },
      });

      expect(prompt).toBeDefined();
      expect(prompt.messages).toBeDefined();
      expect(prompt.messages[0].content.text).toContain('TestButton');
      expect(prompt.messages[0].content.text).toContain('reusable button component');
    });

    it('should work with minimal arguments', async () => {
      const prompt = await client.getPrompt({
        name: 'generate-component',
        arguments: {
          component_name: 'Card',
          component_description: 'A simple card component',
        },
      });

      expect(prompt).toBeDefined();
      expect(prompt.messages[0].content.text).toContain('Card');
      expect(prompt.messages[0].content.text).toContain('tailwind'); // default styling
    });
  });

  describe('create-webapp prompt', () => {
    it('should generate web app generation prompt', async () => {
      const prompt = await client.getPrompt({
        name: 'create-webapp',
        arguments: {
          app_description: 'A task management application',
          framework: 'nextjs',
          features: 'authentication,database,api',
          styling_system: 'tailwind',
          database_type: 'postgresql',
          deployment_target: 'vercel',
          include_auth: 'true',
          include_api: 'true',
        },
      });

      expect(prompt).toBeDefined();
      expect(prompt.messages).toBeDefined();
      expect(prompt.messages[0].content.text).toContain('task management');
      expect(prompt.messages[0].content.text).toContain('nextjs');
    });
  });

  describe('refactor-component prompt', () => {
    it('should generate component refactoring prompt', async () => {
      const prompt = await client.getPrompt({
        name: 'refactor-component',
        arguments: {
          code: 'const Button = () => <button>Click</button>',
          target_framework: 'react',
          typescript_level: 'strict',
          component_type: 'functional',
          include_tests: 'false',
          preserve_functionality: 'true',
          focus_areas: 'performance,accessibility',
        },
      });

      expect(prompt).toBeDefined();
      expect(prompt.messages).toBeDefined();
      expect(prompt.messages[0].content.text).toContain('refactor');
      expect(prompt.messages[0].content.text).toContain('performance,accessibility');
    });
  });

  describe('generate-css-theme prompt', () => {
    it('should generate CSS theme generation prompt', async () => {
      const prompt = await client.getPrompt({
        name: 'generate-css-theme',
        arguments: {
          theme_name: 'Ocean Blue',
          primary_color: '#0066cc',
          secondary_color: '#00a86b',
          neutral_color: '#gray',
          border_radius: '0.5rem',
          output_format: 'both',
          generate_tailwind_config: 'true',
          include_dark_mode: 'true',
        },
      });

      expect(prompt).toBeDefined();
      expect(prompt.messages).toBeDefined();
      expect(prompt.messages[0].content.text).toContain('Ocean Blue');
      expect(prompt.messages[0].content.text).toContain('#0066cc');
    });
  });

  describe('generate-shadcn-component prompt', () => {
    it('should generate shadcn component generation prompt', async () => {
      const prompt = await client.getPrompt({
        name: 'generate-shadcn-component',
        arguments: {
          component_name: 'DataTable',
          component_type: 'data-display',
          shadcn_components: 'table,button,input',
          features: 'sorting,filtering',
          styling_approach: 'variants',
          include_custom_hooks: 'true',
          accessibility_level: 'enhanced',
        },
      });

      expect(prompt).toBeDefined();
      expect(prompt.messages).toBeDefined();
      expect(prompt.messages[0].content.text).toContain('DataTable');
      expect(prompt.messages[0].content.text).toContain('shadcn/ui');
    });
  });

  describe('generate-tailwind-layout prompt', () => {
    it('should generate Tailwind layout generation prompt', async () => {
      const prompt = await client.getPrompt({
        name: 'generate-tailwind-layout',
        arguments: {
          layout_name: 'DashboardLayout',
          layout_variants: 'sidebar,header-footer',
          pages_to_scaffold: 'home,settings,profile',
          include_dark_mode: 'true',
          use_shadcn_ui: 'false',
          responsive_breakpoints: 'sm,md,lg,xl',
          navigation_type: 'sidebar',
        },
      });

      expect(prompt).toBeDefined();
      expect(prompt.messages).toBeDefined();
      expect(prompt.messages[0].content.text).toContain('DashboardLayout');
      expect(prompt.messages[0].content.text).toContain('responsive');
    });
  });

  describe('Prompt Discovery', () => {
    it('should list all available prompts', async () => {
      const prompts = await client.listPrompts();
      
      expect(prompts).toBeDefined();
      expect(prompts.prompts).toBeDefined();
      expect(Array.isArray(prompts.prompts)).toBe(true);
      
      const promptNames = prompts.prompts.map(prompt => prompt.name);
      expect(promptNames).toContain('audit-accessibility');
      expect(promptNames).toContain('generate-component');
      expect(promptNames).toContain('refactor-component');
      expect(promptNames).toContain('generate-css-theme');
      expect(promptNames).toContain('generate-shadcn-component');
      expect(promptNames).toContain('generate-tailwind-layout');
      expect(promptNames).toContain('create-webapp');
    });

    it('should provide prompt descriptions and arguments', async () => {
      const prompts = await client.listPrompts();
      
      const accessibilityPrompt = prompts.prompts.find(p => p.name === 'audit-accessibility');
      expect(accessibilityPrompt).toBeDefined();
      expect(accessibilityPrompt?.description).toBeDefined();
      expect(accessibilityPrompt?.arguments).toBeDefined();
      expect(Array.isArray(accessibilityPrompt?.arguments)).toBe(true);
      
      // Check that arguments have proper metadata
      const codeArg = accessibilityPrompt?.arguments?.find(a => a.name === 'code');
      expect(codeArg).toBeDefined();
      expect(codeArg?.required).toBe(true);
      expect(codeArg?.description).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid prompt names', async () => {
      try {
        await client.getPrompt({
          name: 'non-existent-prompt',
          arguments: {},
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle missing required arguments', async () => {
      try {
        await client.getPrompt({
          name: 'audit-accessibility',
          arguments: {
            // Missing required 'code' argument
            audit_level: 'comprehensive',
          },
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});