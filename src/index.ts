import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { generateText, streamText } from 'ai';
import { createVercel } from '@ai-sdk/vercel';
import { z } from 'zod';
import 'dotenv/config';

// Validate environment variables
const V0_API_KEY = process.env['V0_API_KEY'];
if (!V0_API_KEY) {
  console.error('V0_API_KEY environment variable is required');
  process.exit(1);
}

// Create the MCP server
const server = new McpServer({
  name: 'v0-mcp-ts',
  version: '1.0.0',
  description:
    'A powerful MCP server integrating v0.dev AI capabilities for modern web development',
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

// Resource: API documentation
server.resource('v0-api-docs', 'v0://api-docs', async () => ({
  contents: [
    {
      uri: 'v0://api-docs',
      mimeType: 'text/markdown',
      text: `# v0.dev API Documentation

## Model: v0-1.0-md

The v0-1.0-md model is designed for building modern web applications with the following features:

- **Framework aware**: Optimized for Next.js, React, Vue, Svelte and other modern frameworks
- **Auto-fix**: Automatically identifies and corrects common coding issues
- **Quick edit**: Provides streaming inline edits
- **Multimodal**: Supports both text and image inputs
- **OpenAI compatible**: Works with standard OpenAI API format

## Usage Limits

- Max messages per day: 200
- Max context window: 128,000 tokens
- Max output: 32,000 tokens

## Best Practices

1. Be specific about the framework and features you want
2. Provide context about existing code when asking for enhancements
3. Include error messages when debugging
4. Specify component props and styling requirements

## Supported Frameworks

- Next.js (recommended)
- React
- Vue
- Svelte
- And other modern web frameworks

For more information, visit: https://vercel.com/docs/v0/api`,
    },
  ],
}));

// Prompt: Generate a web app with specific requirements
server.prompt(
  'create-webapp',
  {
    description: z.string().describe('Description of the web application'),
    framework: z.string().optional().describe('Preferred framework'),
    features: z
      .string()
      .optional()
      .describe('Comma-separated list of features'),
  },
  ({ description, framework = 'nextjs', features = '' }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Create a ${framework} web application: ${description}

${features ? `Required features: ${features}` : ''}

Please provide:
1. Complete file structure
2. All necessary code files
3. Package.json with dependencies
4. Setup instructions
5. Best practices implementation

Make it production-ready with proper error handling, TypeScript types, and modern patterns.`,
        },
      },
    ],
  })
);

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('v0-mcp-ts server started successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch(console.error);
