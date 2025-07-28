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
    description: '🚀 A high-performance Model Context Protocol server that integrates v0.dev AI capabilities for modern web development. Generate React components, audit accessibility, create Tailwind layouts, and debug code with AI assistance. Powered by Node.js LTS and optimized for production use.',
    version: '2.0.0',
    author: 'Nicolas Torres <nicotordev@gmail.com>',
    organization: 'Conce-AI',
    homepage: 'https://github.com/Conce-AI/v0.dev',
    repository: 'https://github.com/Conce-AI/v0.dev.git',
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
      'nodejs',
      'performance',
      'conce-ai',
      'chile',
      'nicotordev',
      'tailwindcss',
      'shadcn',
      'accessibility',
      'react'
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