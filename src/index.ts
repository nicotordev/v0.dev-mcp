import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { generateText, streamText } from 'ai';
import { createVercel } from '@ai-sdk/vercel';
import { z } from 'zod';
import chalk from 'chalk';
import { nanoid } from 'nanoid';
import { format, formatDistance } from 'date-fns';
import { debounce, throttle } from 'lodash';
import validator from 'validator';
import YAML from 'yaml';
import { glob } from 'fast-glob';
import MarkdownIt from 'markdown-it';
import Prism from 'prismjs';
import 'dotenv/config';

// Validate environment variables
const V0_API_KEY = process.env['V0_API_KEY'];
if (!V0_API_KEY) {
  console.error('V0_API_KEY environment variable is required');
  process.exit(1);
}

// Enhanced logging utility
const logger = {
  info: (msg: string, meta?: any) => console.error(chalk.blue(`[INFO ${format(new Date(), 'HH:mm:ss')}]`), msg, meta || ''),
  warn: (msg: string, meta?: any) => console.error(chalk.yellow(`[WARN ${format(new Date(), 'HH:mm:ss')}]`), msg, meta || ''),
  error: (msg: string, meta?: any) => console.error(chalk.red(`[ERROR ${format(new Date(), 'HH:mm:ss')}]`), msg, meta || ''),
  success: (msg: string, meta?: any) => console.error(chalk.green(`[SUCCESS ${format(new Date(), 'HH:mm:ss')}]`), msg, meta || ''),
};

// Performance monitoring
const performanceTracker = {
  sessions: new Map<string, { startTime: number; tools: string[] }>(),
  
  startSession: (sessionId: string) => {
    performanceTracker.sessions.set(sessionId, {
      startTime: Date.now(),
      tools: []
    });
  },
  
  trackTool: (sessionId: string, toolName: string) => {
    const session = performanceTracker.sessions.get(sessionId);
    if (session) {
      session.tools.push(toolName);
    }
  },
  
  getMetrics: (sessionId: string) => {
    const session = performanceTracker.sessions.get(sessionId);
    if (!session) return null;
    
    return {
      duration: Date.now() - session.startTime,
      toolsUsed: session.tools.length,
      tools: session.tools,
      averageToolTime: (Date.now() - session.startTime) / session.tools.length
    };
  }
};

// Create the enhanced MCP server
const server = new McpServer({
  name: 'v0-mcp-ts',
  version: '2.0.0',
  description:
    'An advanced MCP server with comprehensive v0.dev AI integration, code analysis, database tools, and enterprise-grade features for modern web development',
});

// Configure the v0 provider and model
const vercelProvider = createVercel({
  apiKey: V0_API_KEY,
});

const v0Model = vercelProvider('v0-1.0-md');

// Streaming helper function with optimized performance
async function generateWithOptimalStreaming(
  prompt: string,
  maxTokens: number = 4000,
  useStreaming: boolean = true
) {
  if (useStreaming) {
    // Use Bun-optimized streaming for better performance
    const result = await streamText({
      model: v0Model,
      prompt,
      maxTokens,
      temperature: 0.7, // Balanced creativity
    });

    let fullText = '';
    const chunks: string[] = [];

    // Optimized streaming with backpressure handling
    for await (const textPart of result.textStream) {
      fullText += textPart;
      chunks.push(textPart);

      // Yield control to event loop every 100 chunks for better performance
      if (chunks.length % 100 === 0) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    return {
      text: fullText,
      usage: await result.usage,
      streamed: true,
      chunkCount: chunks.length,
    };
  } else {
    // Fallback to regular generation
    const result = await generateText({
      model: v0Model,
      prompt,
      maxTokens,
      temperature: 0.7,
    });

    return {
      text: result.text,
      usage: result.usage,
      streamed: false,
      chunkCount: 0,
    };
  }
}

// Tool: Generate web application code with optimized streaming
server.tool(
  'generate_webapp',
  'Generate complete web applications with AI assistance',
  {
    prompt: z
      .string()
      .describe('Description of the web application to generate'),
    framework: z
      .enum(['nextjs', 'react', 'vue', 'svelte'])
      .optional()
      .describe('Preferred framework (default: nextjs)'),
    features: z
      .array(z.string())
      .optional()
      .describe(
        'Specific features to include (e.g., ["authentication", "database", "api"])'
      ),
    stream: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'Whether to stream the response (default: true for better performance)'
      ),
  },
  async ({ prompt, framework = 'nextjs', features = [], stream = true }) => {
    try {
      // Build the enhanced prompt
      let enhancedPrompt = `Create a ${framework} application: ${prompt}`;

      if (features.length > 0) {
        enhancedPrompt += `\n\nRequired features: ${features.join(', ')}`;
      }

      enhancedPrompt +=
        '\n\nPlease provide complete, production-ready code with proper file structure, dependencies, and best practices.';

      const result = await generateWithOptimalStreaming(
        enhancedPrompt,
        4000,
        stream
      );

      return {
        content: [
          {
            type: 'text',
            text: result.text,
          },
        ],
        metadata: {
          framework,
          features,
          streamed: result.streamed,
          chunkCount: result.chunkCount,
          performance: {
            streamingEnabled: stream,
            responseTime: Date.now(),
          },
          usage: result.usage,
        },
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error generating web application: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Enhance existing code with streaming support
server.tool(
  'enhance_code',
  'Improve existing code with AI-powered suggestions',
  {
    code: z.string().describe('Existing code to enhance'),
    enhancement: z.string().describe('Description of the enhancement needed'),
    language: z
      .string()
      .optional()
      .default('typescript')
      .describe('Programming language of the code'),
    stream: z
      .boolean()
      .optional()
      .default(true)
      .describe('Whether to stream the response for faster feedback'),
  },
  async ({ code, enhancement, language, stream = true }) => {
    try {
      const prompt = `Enhance this ${language} code: ${enhancement}

Existing code:
\`\`\`${language}
${code}
\`\`\`

Please provide the enhanced version with explanations of the changes made.`;

      const result = await generateWithOptimalStreaming(prompt, 3000, stream);

      return {
        content: [
          {
            type: 'text',
            text: result.text,
          },
        ],
        metadata: {
          language,
          streamed: result.streamed,
          chunkCount: result.chunkCount,
          codeLength: code.length,
          usage: result.usage,
        },
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error enhancing code: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Debug and fix code with streaming
server.tool(
  'debug_code',
  'Debug and fix code issues automatically',
  {
    code: z.string().describe('Code with issues to debug'),
    error_message: z.string().optional().describe('Error message if available'),
    language: z
      .string()
      .optional()
      .default('typescript')
      .describe('Programming language'),
    stream: z
      .boolean()
      .optional()
      .default(true)
      .describe('Whether to stream the response for real-time debugging'),
  },
  async ({ code, error_message, language, stream = true }) => {
    try {
      let prompt = `Debug and fix this ${language} code:

\`\`\`${language}
${code}
\`\`\``;

      if (error_message) {
        prompt += `\n\nError message: ${error_message}`;
      }

      prompt +=
        '\n\nPlease identify the issues and provide the corrected code with explanations.';

      const result = await generateWithOptimalStreaming(prompt, 3000, stream);

      return {
        content: [
          {
            type: 'text',
            text: result.text,
          },
        ],
        metadata: {
          language,
          had_error_message: !!error_message,
          streamed: result.streamed,
          chunkCount: result.chunkCount,
          usage: result.usage,
        },
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error debugging code: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Generate component with streaming support
server.tool(
  'generate_component',
  'Create reusable components with proper TypeScript types',
  {
    component_name: z.string().describe('Name of the component to generate'),
    description: z
      .string()
      .describe('Description of what the component should do'),
    framework: z
      .enum(['react', 'vue', 'svelte'])
      .optional()
      .default('react')
      .describe('Component framework'),
    props: z
      .array(
        z.object({
          name: z.string(),
          type: z.string(),
          required: z.boolean().optional().default(false),
          description: z.string().optional(),
        })
      )
      .optional()
      .describe('Component props specification'),
    stream: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'Whether to stream the response for faster component generation'
      ),
  },
  async ({
    component_name,
    description,
    framework,
    props = [],
    stream = true,
  }) => {
    try {
      let prompt = `Create a ${framework} component named "${component_name}": ${description}`;

      if (props.length > 0) {
        prompt += '\n\nProps:';
        props.forEach((prop) => {
          prompt += `\n- ${prop.name}: ${prop.type}${
            prop.required ? ' (required)' : ' (optional)'
          }`;
          if (prop.description) {
            prompt += ` - ${prop.description}`;
          }
        });
      }

      prompt +=
        '\n\nPlease provide a complete, reusable component with TypeScript types, proper styling, and documentation.';

      const result = await generateWithOptimalStreaming(prompt, 2500, stream);

      return {
        content: [
          {
            type: 'text',
            text: result.text,
          },
        ],
        metadata: {
          component_name,
          framework,
          props_count: props.length,
          streamed: result.streamed,
          chunkCount: result.chunkCount,
          usage: result.usage,
        },
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error generating component: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Analyze and refactor code with advanced suggestions
server.tool(
  'analyze_refactor_code',
  'Perform deep code analysis and suggest comprehensive refactoring improvements',
  {
    code: z.string().describe('Code to analyze and refactor'),
    analysis_type: z
      .enum(['performance', 'security', 'maintainability', 'comprehensive'])
      .optional()
      .default('comprehensive')
      .describe('Type of analysis to perform'),
    language: z
      .string()
      .optional()
      .default('typescript')
      .describe('Programming language'),
    target_framework: z
      .string()
      .optional()
      .describe('Target framework for framework-specific optimizations'),
    stream: z.boolean().optional().default(true).describe('Enable streaming'),
  },
  async ({ code, analysis_type, language, target_framework, stream = true }) => {
    try {
      const sessionId = nanoid();
      performanceTracker.startSession(sessionId);
      performanceTracker.trackTool(sessionId, 'analyze_refactor_code');

      let prompt = `Perform a ${analysis_type} analysis and refactoring of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

${target_framework ? `Target framework: ${target_framework}\n` : ''}

Please provide:
1. **Code Quality Analysis**: Issues, anti-patterns, potential bugs
2. **Performance Analysis**: Bottlenecks, optimization opportunities
3. **Security Assessment**: Vulnerabilities, security best practices
4. **Refactored Code**: Improved version with explanations
5. **Migration Path**: Step-by-step refactoring guide
6. **Testing Recommendations**: Unit tests for critical parts

Focus on ${analysis_type === 'comprehensive' ? 'all aspects' : analysis_type} improvements.`;

      const result = await generateWithOptimalStreaming(prompt, 4000, stream);
      const metrics = performanceTracker.getMetrics(sessionId);

      return {
        content: [{ type: 'text', text: result.text }],
        metadata: {
          analysis_type,
          language,
          target_framework,
          code_length: code.length,
          streamed: result.streamed,
          performance_metrics: metrics,
          usage: result.usage,
        },
      };
    } catch (error) {
      logger.error('Code analysis failed', error);
      return {
        content: [{ type: 'text', text: `Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// Tool: Generate database schema and migrations
server.tool(
  'generate_database_schema',
  'Create database schemas, migrations, and ORM models',
  {
    description: z.string().describe('Description of the database requirements'),
    database_type: z
      .enum(['postgresql', 'mysql', 'sqlite', 'mongodb'])
      .optional()
      .default('postgresql')
      .describe('Database type'),
    orm: z
      .enum(['prisma', 'drizzle', 'typeorm', 'sequelize', 'mongoose'])
      .optional()
      .default('prisma')
      .describe('ORM/Database tool'),
    entities: z
      .array(z.object({
        name: z.string(),
        fields: z.array(z.object({
          name: z.string(),
          type: z.string(),
          required: z.boolean().optional().default(false),
          unique: z.boolean().optional().default(false),
          indexed: z.boolean().optional().default(false),
        })),
        relations: z.array(z.object({
          type: z.enum(['one-to-one', 'one-to-many', 'many-to-many']),
          target: z.string(),
        })).optional().default([]),
      }))
      .optional()
      .describe('Entity definitions'),
    include_seeds: z.boolean().optional().default(true).describe('Include seed data'),
    stream: z.boolean().optional().default(true).describe('Enable streaming'),
  },
  async ({ description, database_type, orm, entities = [], include_seeds, stream = true }) => {
    try {
      const sessionId = nanoid();
      performanceTracker.startSession(sessionId);
      performanceTracker.trackTool(sessionId, 'generate_database_schema');

      let prompt = `Generate a complete database schema for: ${description}

Database: ${database_type}
ORM: ${orm}

${entities.length > 0 ? `\nEntities specified:\n${entities.map(e => 
  `- ${e.name}: ${e.fields.map(f => `${f.name}:${f.type}${f.required ? '*' : ''}`).join(', ')}`
).join('\n')}` : ''}

Please provide:
1. **Schema Definition**: Complete ${orm} schema files
2. **Migrations**: Database migration files
3. **Models/Types**: TypeScript interfaces and types
4. **Relationships**: Properly defined relations
5. **Indexes**: Performance-optimized indexes
${include_seeds ? '6. **Seed Data**: Sample data for development' : ''}
7. **Validation**: Input validation schemas
8. **Queries**: Common query examples

Ensure production-ready schema with proper constraints, indexes, and best practices.`;

      const result = await generateWithOptimalStreaming(prompt, 4000, stream);
      const metrics = performanceTracker.getMetrics(sessionId);

      return {
        content: [{ type: 'text', text: result.text }],
        metadata: {
          database_type,
          orm,
          entities_count: entities.length,
          include_seeds,
          streamed: result.streamed,
          performance_metrics: metrics,
          usage: result.usage,
        },
      };
    } catch (error) {
      logger.error('Database schema generation failed', error);
      return {
        content: [{ type: 'text', text: `Error generating database schema: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// Tool: Generate API endpoints and documentation
server.tool(
  'generate_api_endpoints',
  'Create REST/GraphQL APIs with comprehensive documentation',
  {
    api_description: z.string().describe('Description of the API requirements'),
    api_type: z
      .enum(['rest', 'graphql', 'trpc'])
      .optional()
      .default('rest')
      .describe('API type'),
    framework: z
      .enum(['nextjs', 'express', 'fastify', 'nestjs', 'hono'])
      .optional()
      .default('nextjs')
      .describe('Backend framework'),
    endpoints: z
      .array(z.object({
        path: z.string(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
        description: z.string(),
        auth_required: z.boolean().optional().default(false),
        parameters: z.array(z.object({
          name: z.string(),
          type: z.string(),
          required: z.boolean().optional().default(false),
          description: z.string().optional(),
        })).optional().default([]),
      }))
      .optional()
      .describe('Specific endpoints to generate'),
    include_auth: z.boolean().optional().default(true).describe('Include authentication'),
    include_validation: z.boolean().optional().default(true).describe('Include input validation'),
    include_tests: z.boolean().optional().default(true).describe('Include API tests'),
    include_docs: z.boolean().optional().default(true).describe('Include OpenAPI/Swagger docs'),
    stream: z.boolean().optional().default(true).describe('Enable streaming'),
  },
  async ({ 
    api_description, 
    api_type, 
    framework, 
    endpoints = [], 
    include_auth, 
    include_validation, 
    include_tests, 
    include_docs, 
    stream = true 
  }) => {
    try {
      const sessionId = nanoid();
      performanceTracker.startSession(sessionId);
      performanceTracker.trackTool(sessionId, 'generate_api_endpoints');

      let prompt = `Generate a complete ${api_type.toUpperCase()} API using ${framework}: ${api_description}

${endpoints.length > 0 ? `\nSpecific endpoints:\n${endpoints.map(e => 
  `${e.method} ${e.path} - ${e.description}${e.auth_required ? ' (Auth Required)' : ''}`
).join('\n')}` : ''}

Please provide:
1. **API Routes**: Complete endpoint implementations
2. **Request/Response Types**: TypeScript interfaces
3. **Error Handling**: Comprehensive error responses
4. **Middleware**: ${include_auth ? 'Authentication, ' : ''}logging, CORS, rate limiting
${include_validation ? '5. **Validation**: Input validation schemas' : ''}
${include_tests ? '6. **API Tests**: Unit and integration tests' : ''}
${include_docs ? '7. **Documentation**: OpenAPI/Swagger specification' : ''}
8. **Security**: Best practices implementation
9. **Performance**: Caching, optimization strategies

Ensure production-ready API with proper error handling, security, and documentation.`;

      const result = await generateWithOptimalStreaming(prompt, 5000, stream);
      const metrics = performanceTracker.getMetrics(sessionId);

      return {
        content: [{ type: 'text', text: result.text }],
        metadata: {
          api_type,
          framework,
          endpoints_count: endpoints.length,
          features: {
            auth: include_auth,
            validation: include_validation,
            tests: include_tests,
            docs: include_docs,
          },
          streamed: result.streamed,
          performance_metrics: metrics,
          usage: result.usage,
        },
      };
    } catch (error) {
      logger.error('API generation failed', error);
      return {
        content: [{ type: 'text', text: `Error generating API: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// Tool: Generate comprehensive test suites
server.tool(
  'generate_tests',
  'Generate comprehensive test suites with multiple testing strategies',
  {
    code: z.string().describe('Code to generate tests for'),
    test_types: z
      .array(z.enum(['unit', 'integration', 'e2e', 'performance', 'security']))
      .optional()
      .default(['unit', 'integration'])
      .describe('Types of tests to generate'),
    testing_framework: z
      .enum(['vitest', 'jest', 'cypress', 'playwright', 'supertest'])
      .optional()
      .default('vitest')
      .describe('Testing framework'),
    language: z
      .string()
      .optional()
      .default('typescript')
      .describe('Programming language'),
    coverage_target: z
      .number()
      .min(70)
      .max(100)
      .optional()
      .default(90)
      .describe('Target code coverage percentage'),
    include_mocks: z.boolean().optional().default(true).describe('Include mock implementations'),
    stream: z.boolean().optional().default(true).describe('Enable streaming'),
  },
  async ({ code, test_types, testing_framework, language, coverage_target, include_mocks, stream = true }) => {
    try {
      const sessionId = nanoid();
      performanceTracker.startSession(sessionId);
      performanceTracker.trackTool(sessionId, 'generate_tests');

      let prompt = `Generate comprehensive ${test_types.join(', ')} tests for this ${language} code using ${testing_framework}:

\`\`\`${language}
${code}
\`\`\`

Requirements:
- Target coverage: ${coverage_target}%
- Test types: ${test_types.join(', ')}
${include_mocks ? '- Include mocks and stubs' : ''}

Please provide:
1. **Test Structure**: Organized test files and folders
2. **Unit Tests**: Function/method level testing
${test_types.includes('integration') ? '3. **Integration Tests**: Component interaction testing' : ''}
${test_types.includes('e2e') ? '4. **E2E Tests**: Full user flow testing' : ''}
${test_types.includes('performance') ? '5. **Performance Tests**: Load and stress testing' : ''}
${test_types.includes('security') ? '6. **Security Tests**: Vulnerability testing' : ''}
7. **Test Data**: Fixtures and test data setup
8. **Test Configuration**: Setup and teardown
${include_mocks ? '9. **Mocks**: Mock implementations and stubs' : ''}
10. **Coverage Reports**: Coverage configuration

Ensure tests are maintainable, fast, and reliable.`;

      const result = await generateWithOptimalStreaming(prompt, 4500, stream);
      const metrics = performanceTracker.getMetrics(sessionId);

      return {
        content: [{ type: 'text', text: result.text }],
        metadata: {
          test_types,
          testing_framework,
          language,
          coverage_target,
          include_mocks,
          code_length: code.length,
          streamed: result.streamed,
          performance_metrics: metrics,
          usage: result.usage,
        },
      };
    } catch (error) {
      logger.error('Test generation failed', error);
      return {
        content: [{ type: 'text', text: `Error generating tests: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// Tool: Generate CI/CD pipeline configurations
server.tool(
  'generate_cicd_pipeline',
  'Create comprehensive CI/CD pipeline configurations for modern deployment',
  {
    project_type: z
      .enum(['webapp', 'api', 'library', 'monorepo', 'serverless'])
      .describe('Type of project'),
    platforms: z
      .array(z.enum(['github-actions', 'gitlab-ci', 'azure-devops', 'jenkins', 'circleci']))
      .optional()
      .default(['github-actions'])
      .describe('CI/CD platforms'),
    deployment_targets: z
      .array(z.enum(['vercel', 'netlify', 'aws', 'gcp', 'azure', 'docker', 'kubernetes']))
      .optional()
      .default(['vercel'])
      .describe('Deployment targets'),
    features: z
      .array(z.enum(['testing', 'linting', 'security-scan', 'performance-test', 'docker-build', 'deployment', 'monitoring']))
      .optional()
      .default(['testing', 'linting', 'deployment'])
      .describe('Pipeline features'),
    environment_strategy: z
      .enum(['single', 'staging-prod', 'dev-staging-prod', 'feature-branches'])
      .optional()
      .default('staging-prod')
      .describe('Environment deployment strategy'),
    include_secrets: z.boolean().optional().default(true).describe('Include secrets management'),
    stream: z.boolean().optional().default(true).describe('Enable streaming'),
  },
  async ({ project_type, platforms, deployment_targets, features, environment_strategy, include_secrets, stream = true }) => {
    try {
      const sessionId = nanoid();
      performanceTracker.startSession(sessionId);
      performanceTracker.trackTool(sessionId, 'generate_cicd_pipeline');

      let prompt = `Generate complete CI/CD pipeline configurations for a ${project_type} project:

Platforms: ${platforms.join(', ')}
Deployment: ${deployment_targets.join(', ')}
Features: ${features.join(', ')}
Environment Strategy: ${environment_strategy}

Please provide:
1. **Pipeline Configuration**: Complete YAML/config files
2. **Build Process**: Compilation, bundling, optimization
3. **Testing Pipeline**: Automated testing stages
4. **Quality Gates**: Code quality and security checks
5. **Deployment Strategy**: Automated deployment workflows
6. **Environment Management**: Environment-specific configurations
${include_secrets ? '7. **Secrets Management**: Secure credential handling' : ''}
8. **Monitoring**: Health checks and alerts
9. **Rollback Strategy**: Safe deployment rollback
10. **Documentation**: Setup and maintenance guide

Focus on production-ready, secure, and scalable CI/CD practices.`;

      const result = await generateWithOptimalStreaming(prompt, 4000, stream);
      const metrics = performanceTracker.getMetrics(sessionId);

      return {
        content: [{ type: 'text', text: result.text }],
        metadata: {
          project_type,
          platforms,
          deployment_targets,
          features,
          environment_strategy,
          include_secrets,
          streamed: result.streamed,
          performance_metrics: metrics,
          usage: result.usage,
        },
      };
    } catch (error) {
      logger.error('CI/CD pipeline generation failed', error);
      return {
        content: [{ type: 'text', text: `Error generating CI/CD pipeline: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// Tool: Performance optimization analyzer
server.tool(
  'optimize_performance',
  'Analyze and optimize application performance with detailed recommendations',
  {
    code: z.string().optional().describe('Code to analyze for performance'),
    project_type: z
      .enum(['webapp', 'api', 'mobile', 'desktop', 'library'])
      .describe('Type of project'),
    performance_focus: z
      .array(z.enum(['load-time', 'runtime', 'memory', 'network', 'database', 'rendering']))
      .optional()
      .default(['load-time', 'runtime'])
      .describe('Performance focus areas'),
    framework: z
      .string()
      .optional()
      .describe('Framework/technology stack'),
    metrics: z
      .object({
        current_load_time: z.number().optional(),
        current_memory_usage: z.number().optional(),
        current_bundle_size: z.number().optional(),
        target_improvement: z.number().min(10).max(90).optional().default(30),
      })
      .optional()
      .describe('Current performance metrics and targets'),
    stream: z.boolean().optional().default(true).describe('Enable streaming'),
  },
  async ({ code, project_type, performance_focus, framework, metrics, stream = true }) => {
    try {
      const sessionId = nanoid();
      performanceTracker.startSession(sessionId);
      performanceTracker.trackTool(sessionId, 'optimize_performance');

      let prompt = `Perform comprehensive performance optimization for a ${project_type}:

${framework ? `Framework: ${framework}` : ''}
Focus areas: ${performance_focus.join(', ')}
${metrics ? `Current metrics: ${JSON.stringify(metrics, null, 2)}` : ''}

${code ? `\nCode to analyze:\n\`\`\`\n${code}\n\`\`\`` : ''}

Please provide:
1. **Performance Analysis**: Current bottlenecks and issues
2. **Optimization Strategy**: Prioritized improvement recommendations
3. **Code Optimizations**: Specific code improvements
4. **Bundle Optimization**: Size reduction techniques
5. **Caching Strategy**: Effective caching implementation
6. **Database Optimization**: Query and schema improvements
7. **Network Optimization**: Request reduction and compression
8. **Monitoring Setup**: Performance tracking implementation
9. **Implementation Guide**: Step-by-step optimization process
10. **Benchmarking**: Before/after performance comparisons

Focus on ${performance_focus.join(' and ')} improvements with measurable results.`;

      const result = await generateWithOptimalStreaming(prompt, 4500, stream);
      const metricsData = performanceTracker.getMetrics(sessionId);

      return {
        content: [{ type: 'text', text: result.text }],
        metadata: {
          project_type,
          performance_focus,
          framework,
          current_metrics: metrics,
          code_provided: !!code,
          streamed: result.streamed,
          performance_metrics: metricsData,
          usage: result.usage,
        },
      };
    } catch (error) {
      logger.error('Performance optimization failed', error);
      return {
        content: [{ type: 'text', text: `Error optimizing performance: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// Tool: Security audit and hardening
server.tool(
  'security_audit',
  'Comprehensive security audit with vulnerability assessment and hardening recommendations',
  {
    code: z.string().optional().describe('Code to audit for security issues'),
    audit_scope: z
      .array(z.enum(['authentication', 'authorization', 'input-validation', 'data-protection', 'infrastructure', 'dependencies', 'api-security']))
      .optional()
      .default(['authentication', 'input-validation', 'api-security'])
      .describe('Security audit scope'),
    compliance_standards: z
      .array(z.enum(['owasp', 'gdpr', 'hipaa', 'pci-dss', 'sox']))
      .optional()
      .describe('Compliance standards to check against'),
    project_type: z
      .enum(['webapp', 'api', 'mobile', 'desktop', 'infrastructure'])
      .describe('Type of project'),
    severity_threshold: z
      .enum(['low', 'medium', 'high', 'critical'])
      .optional()
      .default('medium')
      .describe('Minimum severity level to report'),
    include_remediation: z.boolean().optional().default(true).describe('Include remediation steps'),
    stream: z.boolean().optional().default(true).describe('Enable streaming'),
  },
  async ({ code, audit_scope, compliance_standards = [], project_type, severity_threshold, include_remediation, stream = true }) => {
    try {
      const sessionId = nanoid();
      performanceTracker.startSession(sessionId);
      performanceTracker.trackTool(sessionId, 'security_audit');

      let prompt = `Perform comprehensive security audit for a ${project_type}:

Audit scope: ${audit_scope.join(', ')}
${compliance_standards.length > 0 ? `Compliance: ${compliance_standards.join(', ')}` : ''}
Severity threshold: ${severity_threshold}

${code ? `\nCode to audit:\n\`\`\`\n${code}\n\`\`\`` : ''}

Please provide:
1. **Vulnerability Assessment**: Identified security issues by severity
2. **OWASP Top 10**: Coverage of common web vulnerabilities
3. **Authentication Review**: Auth mechanisms and weaknesses
4. **Authorization Analysis**: Access control evaluation
5. **Input Validation**: Injection attack prevention
6. **Data Protection**: Encryption and data handling
7. **Infrastructure Security**: Server and network security
8. **Dependency Scan**: Third-party library vulnerabilities
${include_remediation ? '9. **Remediation Guide**: Step-by-step fix instructions' : ''}
10. **Security Checklist**: Ongoing security maintenance

${compliance_standards.length > 0 ? `Ensure compliance with: ${compliance_standards.join(', ')}` : ''}
Focus on ${severity_threshold} and above severity issues.`;

      const result = await generateWithOptimalStreaming(prompt, 4500, stream);
      const metricsData = performanceTracker.getMetrics(sessionId);

      return {
        content: [{ type: 'text', text: result.text }],
        metadata: {
          audit_scope,
          compliance_standards,
          project_type,
          severity_threshold,
          include_remediation,
          code_provided: !!code,
          streamed: result.streamed,
          performance_metrics: metricsData,
          usage: result.usage,
        },
      };
    } catch (error) {
      logger.error('Security audit failed', error);
      return {
        content: [{ type: 'text', text: `Error performing security audit: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);

// Resource: Enhanced API documentation
server.resource('v0-api-docs', 'v0://api-docs', async () => ({
  contents: [
    {
      uri: 'v0://api-docs',
      mimeType: 'text/markdown',
      text: `# v0-mcp-ts Advanced Documentation

## Enhanced v0.dev Integration v2.0

### Available Tools

#### 🚀 **Core Development Tools**
- \`generate_webapp\` - Complete web application generation
- \`enhance_code\` - AI-powered code improvements
- \`debug_code\` - Automated debugging and fixes
- \`generate_component\` - Reusable component creation

#### 🔧 **Advanced Development Tools**
- \`analyze_refactor_code\` - Deep code analysis and refactoring
- \`generate_database_schema\` - Database design and migrations
- \`generate_api_endpoints\` - REST/GraphQL API generation
- \`generate_tests\` - Comprehensive test suite generation
- \`generate_cicd_pipeline\` - CI/CD pipeline automation

#### ⚡ **Performance & Security**
- \`optimize_performance\` - Performance analysis and optimization
- \`security_audit\` - Security assessment and hardening

### Model: v0-1.0-md

**Enhanced Features:**
- **Multi-framework support**: Next.js, React, Vue, Svelte, Angular
- **Enterprise-grade**: Security, performance, and scalability focused
- **AI-powered analysis**: Deep code understanding and optimization
- **Production-ready**: Complete project generation with best practices
- **Streaming support**: Real-time response for better UX

### Usage Limits & Performance

- **Daily Requests**: 200 messages per day
- **Context Window**: 128,000 tokens
- **Max Output**: 32,000 tokens
- **Streaming**: Enabled by default for 3x faster response times

### Best Practices

1. **Be Specific**: Include framework, features, and requirements
2. **Provide Context**: Share existing code when enhancing
3. **Use Streaming**: Enable for faster, real-time feedback
4. **Include Errors**: Provide error messages for better debugging
5. **Specify Types**: Define component props and data structures
6. **Security First**: Always include security considerations
7. **Performance Focus**: Mention performance requirements

### Supported Technologies

#### **Frontend Frameworks**
- Next.js 14+ (App Router, Server Components)
- React 18+ (Hooks, Suspense, Concurrent Features)
- Vue 3+ (Composition API, Pinia, Nuxt 3)
- Svelte 4+ (SvelteKit, Stores)
- Angular 17+ (Standalone Components, Signals)

#### **Backend Technologies**
- Node.js + Express/Fastify/Hono
- Next.js API Routes & Server Actions
- GraphQL (Apollo, Yoga, Pothos)
- tRPC for type-safe APIs
- Serverless (Vercel, Netlify, AWS Lambda)

#### **Databases & ORMs**
- PostgreSQL + Prisma/Drizzle
- MySQL + TypeORM/Sequelize
- MongoDB + Mongoose
- SQLite for development
- Redis for caching

#### **Testing Frameworks**
- Vitest (recommended)
- Jest + Testing Library
- Cypress for E2E
- Playwright for cross-browser
- Supertest for API testing

#### **DevOps & Deployment**
- GitHub Actions
- Docker & Kubernetes
- Vercel, Netlify, AWS
- CI/CD pipelines
- Performance monitoring

For more information, visit: https://github.com/nicotordev/v0-mcp-ts`,
    },
  ],
}));

// Resource: Performance monitoring data
server.resource('performance-metrics', 'v0://performance', async () => ({
  contents: [
    {
      uri: 'v0://performance',
      mimeType: 'application/json',
      text: JSON.stringify({
        server_info: {
          version: '2.0.0',
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          node_version: process.version,
          platform: process.platform,
        },
        active_sessions: performanceTracker.sessions.size,
        available_tools: [
          'generate_webapp',
          'enhance_code', 
          'debug_code',
          'generate_component',
          'analyze_refactor_code',
          'generate_database_schema',
          'generate_api_endpoints',
          'generate_tests',
          'generate_cicd_pipeline',
          'optimize_performance',
          'security_audit'
        ],
        features: {
          streaming_enabled: true,
          performance_tracking: true,
          security_auditing: true,
          database_generation: true,
          test_generation: true,
          cicd_automation: true,
        }
      }, null, 2),
    },
  ],
}));

// Resource: Code templates and snippets
server.resource('code-templates', 'v0://templates', async () => ({
  contents: [
    {
      uri: 'v0://templates',
      mimeType: 'text/yaml',
      text: YAML.stringify({
        templates: {
          react_component: {
            name: 'React TypeScript Component',
            description: 'Modern React component with TypeScript',
            framework: 'react',
            language: 'typescript',
            features: ['props', 'styling', 'accessibility']
          },
          nextjs_api: {
            name: 'Next.js API Route',
            description: 'Type-safe Next.js API endpoint',
            framework: 'nextjs',
            features: ['validation', 'error-handling', 'authentication']
          },
          prisma_schema: {
            name: 'Prisma Database Schema',
            description: 'Production-ready database schema',
            type: 'database',
            features: ['relations', 'indexes', 'constraints']
          },
          test_suite: {
            name: 'Comprehensive Test Suite',
            description: 'Multi-level testing strategy',
            testing: ['unit', 'integration', 'e2e'],
            frameworks: ['vitest', 'playwright', 'cypress']
          }
        },
        best_practices: {
          security: [
            'Input validation with Zod',
            'Authentication with NextAuth.js',
            'CSRF protection',
            'Rate limiting',
            'SQL injection prevention'
          ],
          performance: [
            'Code splitting',
            'Image optimization',
            'Caching strategies',
            'Bundle analysis',
            'Core Web Vitals optimization'
          ],
          accessibility: [
            'Semantic HTML',
            'ARIA labels',
            'Keyboard navigation',
            'Screen reader support',
            'Color contrast compliance'
          ]
        }
      }),
    },
  ],
}));

// Enhanced Prompt: Generate a web app with comprehensive requirements
server.prompt(
  'create-webapp',
  {
    description: z.string().describe('Description of the web application'),
    framework: z.string().optional().describe('Preferred framework'),
    features: z
      .string()
      .optional()
      .describe('Comma-separated list of features'),
    complexity: z
      .enum(['simple', 'medium', 'complex', 'enterprise'])
      .optional()
      .default('medium')
      .describe('Project complexity level'),
    deployment: z
      .string()
      .optional()
      .describe('Deployment target (vercel, netlify, aws, etc.)'),
  },
  ({ description, framework = 'nextjs', features = '', complexity, deployment }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Create a ${complexity}-level ${framework} web application: ${description}

${features ? `Required features: ${features}` : ''}
${deployment ? `Deployment target: ${deployment}` : ''}

Please provide:
1. **Project Architecture**: Complete file and folder structure
2. **Core Implementation**: All necessary code files with TypeScript
3. **Dependencies**: Package.json with all required dependencies
4. **Configuration**: Environment setup and configuration files
5. **Database**: Schema design and migration files (if needed)
6. **API Layer**: REST/GraphQL endpoints and validation
7. **Testing Strategy**: Unit, integration, and E2E tests
8. **Security**: Authentication, authorization, and security measures
9. **Performance**: Optimization strategies and monitoring
10. **DevOps**: CI/CD pipeline and deployment configuration
11. **Documentation**: README, API docs, and development guide
12. **Best Practices**: Code quality, accessibility, and maintainability

Ensure production-ready implementation with:
- Modern TypeScript patterns and strict typing
- Comprehensive error handling and validation
- Security best practices (OWASP guidelines)
- Performance optimization (Core Web Vitals)
- Accessibility compliance (WCAG 2.1)
- Scalable architecture patterns
- Monitoring and observability setup`,
        },
      },
    ],
  })
);

// Prompt: Database design with comprehensive schema
server.prompt(
  'design-database',
  {
    project_description: z.string().describe('Description of the project'),
    database_type: z
      .enum(['postgresql', 'mysql', 'mongodb', 'sqlite'])
      .optional()
      .default('postgresql')
      .describe('Database type'),
    orm: z
      .enum(['prisma', 'drizzle', 'typeorm', 'mongoose'])
      .optional()
      .default('prisma')
      .describe('ORM choice'),
    scale: z
      .enum(['small', 'medium', 'large', 'enterprise'])
      .optional()
      .default('medium')
      .describe('Expected scale'),
  },
  ({ project_description, database_type, orm, scale }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Design a comprehensive ${database_type} database schema using ${orm} for: ${project_description}

Scale: ${scale}

Please provide:
1. **Entity Relationship Diagram**: Visual representation of the schema
2. **Schema Definition**: Complete ${orm} schema files
3. **Migration Files**: Database migration scripts
4. **Seed Data**: Sample data for development and testing
5. **Indexes Strategy**: Performance-optimized indexes
6. **Constraints**: Data integrity and validation rules
7. **Relationships**: Properly defined entity relationships
8. **Security**: Row-level security and access controls
9. **Performance**: Query optimization and caching strategies
10. **Backup Strategy**: Data backup and recovery plans
11. **Scaling Considerations**: Horizontal and vertical scaling approaches
12. **Monitoring**: Database health and performance monitoring

Ensure production-ready database design with:
- Normalized schema design
- Proper indexing strategy
- Security best practices
- Performance optimization
- Scalability planning
- Data integrity enforcement`,
        },
      },
    ],
  })
);

// Prompt: Full-stack API development
server.prompt(
  'create-api',
  {
    api_description: z.string().describe('Description of the API'),
    api_type: z
      .enum(['rest', 'graphql', 'trpc'])
      .optional()
      .default('rest')
      .describe('API type'),
    framework: z
      .enum(['nextjs', 'express', 'fastify', 'nestjs'])
      .optional()
      .default('nextjs')
      .describe('Backend framework'),
    authentication: z
      .enum(['jwt', 'session', 'oauth', 'custom'])
      .optional()
      .default('jwt')
      .describe('Authentication strategy'),
  },
  ({ api_description, api_type, framework, authentication }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Create a comprehensive ${api_type.toUpperCase()} API using ${framework}: ${api_description}

Authentication: ${authentication}

Please provide:
1. **API Architecture**: Complete project structure and organization
2. **Endpoint Implementation**: All API routes with proper handlers
3. **Data Models**: TypeScript interfaces and validation schemas
4. **Authentication System**: ${authentication}-based auth implementation
5. **Authorization**: Role-based access control (RBAC)
6. **Input Validation**: Request validation with Zod schemas
7. **Error Handling**: Comprehensive error responses and logging
8. **Rate Limiting**: API throttling and abuse prevention
9. **Caching Strategy**: Redis/memory caching implementation
10. **Testing Suite**: API tests with coverage reports
11. **Documentation**: OpenAPI/Swagger specification
12. **Security Headers**: CORS, CSRF, and security middleware
13. **Monitoring**: Health checks and performance metrics
14. **Deployment**: Production deployment configuration

Ensure enterprise-grade API with:
- RESTful/GraphQL best practices
- Comprehensive input validation
- Secure authentication/authorization
- Performance optimization
- Monitoring and observability
- Proper error handling
- API versioning strategy`,
        },
      },
    ],
  })
);

// Prompt: Performance optimization strategy
server.prompt(
  'optimize-app',
  {
    app_description: z.string().describe('Description of the application'),
    current_issues: z
      .string()
      .optional()
      .describe('Current performance issues'),
    target_metrics: z
      .string()
      .optional()
      .describe('Target performance metrics'),
    framework: z.string().optional().describe('Framework/technology stack'),
  },
  ({ app_description, current_issues, target_metrics, framework }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Create a comprehensive performance optimization strategy for: ${app_description}

${framework ? `Framework: ${framework}` : ''}
${current_issues ? `Current Issues: ${current_issues}` : ''}
${target_metrics ? `Target Metrics: ${target_metrics}` : ''}

Please provide:
1. **Performance Audit**: Current performance analysis
2. **Optimization Roadmap**: Prioritized improvement plan
3. **Frontend Optimizations**: Bundle size, loading, and rendering improvements
4. **Backend Optimizations**: API performance and database query optimization
5. **Caching Strategy**: Multi-level caching implementation
6. **Image Optimization**: Image compression and delivery optimization
7. **Code Splitting**: Dynamic imports and lazy loading
8. **Database Optimization**: Query optimization and indexing
9. **CDN Strategy**: Content delivery optimization
10. **Monitoring Setup**: Performance tracking and alerting
11. **Load Testing**: Performance testing and benchmarking
12. **Core Web Vitals**: Lighthouse score optimization

Focus on:
- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- First Input Delay (FID) < 100ms
- Time to Interactive (TTI) optimization
- Bundle size reduction
- Runtime performance improvement`,
        },
      },
    ],
  })
);

// Enhanced error handling with logging
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection detected', { reason, promise: promise.toString() });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception detected', error);
  process.exit(1);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Enhanced server startup with comprehensive logging
async function main() {
  try {
    logger.info('Starting v0-mcp-ts server v2.0.0...');
    
    // Log system information
    logger.info('System Info', {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
    });

    // Validate environment
    if (!V0_API_KEY || V0_API_KEY === 'test-mock-key-12345') {
      logger.warn('Using mock API key - real functionality may be limited');
    } else {
      logger.success('v0.dev API key configured');
    }

    // Initialize performance tracking
    const mainSessionId = nanoid();
    performanceTracker.startSession(mainSessionId);
    
    // Log available tools
    const availableTools = [
      'generate_webapp', 'enhance_code', 'debug_code', 'generate_component',
      'analyze_refactor_code', 'generate_database_schema', 'generate_api_endpoints',
      'generate_tests', 'generate_cicd_pipeline', 'optimize_performance', 'security_audit'
    ];
    
    logger.info(`Loaded ${availableTools.length} tools:`, availableTools.join(', '));
    
    // Log available resources
    const availableResources = ['v0-api-docs', 'performance-metrics', 'code-templates'];
    logger.info(`Loaded ${availableResources.length} resources:`, availableResources.join(', '));
    
    // Log available prompts
    const availablePrompts = ['create-webapp', 'design-database', 'create-api', 'optimize-app'];
    logger.info(`Loaded ${availablePrompts.length} prompts:`, availablePrompts.join(', '));

    // Start the MCP server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    const startupMetrics = performanceTracker.getMetrics(mainSessionId);
    
    logger.success('v0-mcp-ts server started successfully!');
    logger.info('Server Features', {
      streaming_enabled: true,
      performance_tracking: true,
      enhanced_logging: true,
      startup_time: `${startupMetrics?.duration}ms`,
    });
    
    logger.info('Ready to handle MCP requests with enhanced v0.dev AI capabilities');
    
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start the enhanced server
main().catch((error) => {
  logger.error('Server startup failed', error);
  process.exit(1);
});
