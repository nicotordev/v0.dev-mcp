/** @type {import('@smithery/cli').SmitheryConfig} */
export default {
  entry: 'dist/index.js',
  transport: 'stdio',
  build: {
    outFile: '.smithery/index.mjs',
    bundle: true,
    minify: false,
    format: 'esm',
    external: [
      '@modelcontextprotocol/sdk',
      'node:*',
      'fs',
      'path',
      'crypto',
      'os',
      'util'
    ]
  },
  metadata: {
    name: 'v0-mcp-ts',
    displayName: 'v0.dev MCP Server',
    description: 'A powerful Model Context Protocol (MCP) server that integrates v0.dev AI capabilities for modern web development. Powered by Bun for 25x faster performance.',
    version: '1.0.0',
    author: 'Nicolas Torres <nicotordev@gmail.com>',
    homepage: 'https://github.com/nicotordev/v0-mcp-ts',
    repository: 'https://github.com/nicotordev/v0-mcp-ts.git',
    license: 'MIT',
    keywords: [
      'mcp',
      'model-context-protocol',
      'v0.dev',
      'ai',
      'web-development',
      'typescript',
      'claude',
      'code-generation',
      'component-generation',
      'debugging',
      'bun',
      'performance'
    ],
    tags: [
      'ai-tools',
      'web-development',
      'react',
      'component-generation',
      'accessibility',
      'tailwind',
      'shadcn',
      'typescript',
      'debugging'
    ]
  },
  environment: {
    V0_API_KEY: {
      description: 'API key for v0.dev service',
      required: true,
      sensitive: true
    }
  }
};