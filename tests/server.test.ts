import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { cwd } from 'process';

describe('v0.dev MCP Server', () => {
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
      name: 'v0.dev-test-client',
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
      expect(toolNames).toContain('generate_component');
      expect(toolNames).toContain('refactor_component');
      expect(toolNames).toContain('accessibility_auditor');
      expect(toolNames).toContain('shadcn_component_generator');
      expect(toolNames).toContain('tailwind_layout_generator');
      expect(toolNames).toContain('css_theme_generator');
    });

    it('should list available resources', async () => {
      const resources = await client.listResources();
      expect(resources.resources).toBeDefined();
      expect(resources.resources.length).toBeGreaterThan(0);

      const resourceNames = resources.resources.map((r) => r.name);
      expect(resourceNames).toContain('v0-api-docs');
      expect(resourceNames).toContain('performance-metrics');
    });

    it('should list available prompts', async () => {
      const prompts = await client.listPrompts();
      expect(prompts.prompts).toBeDefined();
      expect(prompts.prompts.length).toBeGreaterThan(0);

      const promptNames = prompts.prompts.map((p) => p.name);
      expect(promptNames).toContain('audit-accessibility');
      expect(promptNames).toContain('generate-component');
      expect(promptNames).toContain('refactor-component');
      expect(promptNames).toContain('generate-css-theme');
      expect(promptNames).toContain('generate-shadcn-component');
      expect(promptNames).toContain('generate-tailwind-layout');
      expect(promptNames).toContain('create-webapp');
    });
  });

  describe('Resources', () => {
    it('should read api-docs resource', async () => {
      const resource = await client.readResource({
        uri: 'v0://api-docs',
      });

      expect(resource.contents).toBeDefined();
      expect(resource.contents.length).toBeGreaterThan(0);
      expect(resource.contents[0].text).toBeDefined();
      expect(typeof resource.contents[0].text).toBe('string');
      expect((resource.contents[0].text as string).length).toBeGreaterThan(0);
    });

    it('should read performance-metrics resource', async () => {
      const resource = await client.readResource({
        uri: 'v0://performance',
      });

      expect(resource.contents).toBeDefined();
      expect(resource.contents.length).toBeGreaterThan(0);
      expect(resource.contents[0].text).toBeDefined();
      expect(typeof resource.contents[0].text).toBe('string');
    });
  });

  describe('Tool Schema Validation', () => {
    it('should have correct generate_component tool schema', async () => {
      const tools = await client.listTools();
      const generateComponent = tools.tools.find(
        (t) => t.name === 'generate_component'
      );

      expect(generateComponent).toBeDefined();
      expect(generateComponent?.description).toBeDefined();
      expect(generateComponent?.inputSchema).toBeDefined();

      const schema = generateComponent!.inputSchema as any;
      expect(schema.properties?.component_name).toBeDefined();
      expect(schema.properties?.theme).toBeDefined();
      expect(schema.properties?.props).toBeDefined();
      expect(schema.properties?.styling).toBeDefined();
    });

    it('should have correct accessibility_auditor tool schema', async () => {
      const tools = await client.listTools();
      const accessibilityAuditor = tools.tools.find(
        (t) => t.name === 'accessibility_auditor'
      );

      expect(accessibilityAuditor).toBeDefined();
      expect(accessibilityAuditor?.description).toBeDefined();
      expect(accessibilityAuditor?.inputSchema).toBeDefined();

      const schema = accessibilityAuditor!.inputSchema as any;
      expect(schema.properties?.code).toBeDefined();
      expect(schema.properties?.audit_level).toBeDefined();
      expect(schema.properties?.framework).toBeDefined();
    });

    it('should have correct css_theme_generator tool schema', async () => {
      const tools = await client.listTools();
      const cssThemeGenerator = tools.tools.find(
        (t) => t.name === 'css_theme_generator'
      );

      expect(cssThemeGenerator).toBeDefined();
      expect(cssThemeGenerator?.description).toBeDefined();
      expect(cssThemeGenerator?.inputSchema).toBeDefined();

      const schema = cssThemeGenerator!.inputSchema as any;
      expect(schema.properties?.theme_name).toBeDefined();
      expect(schema.properties?.primary_color).toBeDefined();
      expect(schema.required).toContain('theme_name');
      expect(schema.required).toContain('primary_color');
    });
  });

  describe('Prompt Schema Validation', () => {
    it('should have correct component-generator prompt', async () => {
      const prompts = await client.listPrompts();
      const componentGeneratorPrompt = prompts.prompts.find(
        (p) => p.name === 'generate-component'
      );

      expect(componentGeneratorPrompt).toBeDefined();
      expect(componentGeneratorPrompt?.description).toBeDefined();
      expect(componentGeneratorPrompt?.arguments).toBeDefined();

      const args = componentGeneratorPrompt!.arguments || [];
      const componentNameArg = args.find((a) => a.name === 'component_name');
      expect(componentNameArg).toBeDefined();
      expect(componentNameArg?.required).toBe(true);

      const themeArg = args.find((a) => a.name === 'theme');
      expect(themeArg).toBeDefined();
    });

    it('should have correct webapp-generator prompt', async () => {
      const prompts = await client.listPrompts();
      const webappGeneratorPrompt = prompts.prompts.find(
        (p) => p.name === 'create-webapp'
      );

      expect(webappGeneratorPrompt).toBeDefined();
      expect(webappGeneratorPrompt?.description).toBeDefined();
      expect(webappGeneratorPrompt?.arguments).toBeDefined();

      const args = webappGeneratorPrompt!.arguments || [];
      const appDescriptionArg = args.find((a) => a.name === 'app_description');
      expect(appDescriptionArg).toBeDefined();
      expect(appDescriptionArg?.required).toBe(true);
    });
  });

  describe('Server Features', () => {
    it('should have proper server information', async () => {
      expect(client).toBeDefined();
      // The server should be running with the reorganized structure
    });

    it('should support all expected capabilities', async () => {
      const tools = await client.listTools();
      const resources = await client.listResources();
      const prompts = await client.listPrompts();

      // Verify all capabilities are present
      expect(tools.tools.length).toBe(6); // 6 tools
      expect(resources.resources.length).toBe(2); // 2 resources
      expect(prompts.prompts.length).toBe(7); // 7 prompts
    });
  });
});