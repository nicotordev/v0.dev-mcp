import { z } from "zod";
import { generateWithOptimalStreaming } from "../lib/streaming";
import { logger } from "../lib/logger";
import { performanceTracker } from "../lib/performance";
import { nanoid } from "nanoid";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types.js";

// Input schema for the tool
export const componentGeneratorSchema = z.object({
  component_name: z
    .string()
    .describe(
      "Name of the component to generate (e.g., 'Button', 'Card', 'Modal')"
    ),
  theme: z.string().describe("Visual theme for the component"),
  props: z
    .array(z.string())
    .optional()
    .default([])
    .describe("Component props (e.g., ['title', 'onClick', 'disabled'])"),
  styling: z
    .enum(["tailwind", "css-modules", "styled-components", "emotion"])
    .optional()
    .default("tailwind")
    .describe("Styling approach to use"),
  stream: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to stream the response for better performance"),
});

// Output schema for the tool
export const componentGeneratorOutputSchema = z.object({
  content: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string(),
      meta: z.record(z.unknown()).optional(),
    })
  ),
  _meta: z
    .object({
      component_name: z.string().optional(),
      theme: z.string().optional(),
      styling: z.string().optional(),
      props_count: z.number().optional(),
      streamed: z.boolean().optional(),
      chunkCount: z.number().optional(),
      performance_metrics: z.unknown().optional(),
      usage: z.unknown().optional(),
    })
    .optional(),
  isError: z.boolean().optional(),
});

// Tool annotations for MCP
export const componentGeneratorAnnotations = {
  inputExample: {
    component_name: "Button",
    theme: "primary",
    props: ["label", "onClick", "disabled"],
    styling: "tailwind",
    stream: true,
  },
  outputExample: {
    content: [
      {
        type: "text",
        text: "// ...generated component code here",
      },
    ],
    _meta: {
      component_name: "Button",
      theme: "primary",
      styling: "tailwind",
      props_count: 3,
      streamed: true,
      chunkCount: 5,
      performance_metrics: {},
      usage: {},
    },
    isError: false,
  },
  categories: ["code-generation", "react", "component", "frontend"],
  tags: ["react", "component", "typescript", "tailwind", "nextjs", "generator"],
  documentation: {
    overview:
      "Generates a fully-typed, themed React/Next.js component with customizable styling and props. Supports Tailwind, CSS Modules, styled-components, and emotion.",
    usage:
      "Call this tool with the desired component name, theme, styling approach, and props. The tool returns a TypeScript component, props interface, usage example, and accessibility notes.",
    legal:
      "This tool generates code using AI. Review all generated code before using it in production. No warranty is provided. You are responsible for ensuring the generated code meets your project's requirements and licensing.",
  },
};

// Result type for handler
export type ComponentGeneratorResult = z.infer<
  typeof componentGeneratorOutputSchema
>;

// Handler function
export const componentGeneratorHandler = async (
  args: z.infer<typeof componentGeneratorSchema>,
  extra?: RequestHandlerExtra<ServerRequest, ServerNotification>
): Promise<ComponentGeneratorResult> => {
  const { component_name, theme, props, styling, stream } = args;

  try {
    const sessionId = nanoid();
    performanceTracker.startSession(sessionId);
    performanceTracker.trackTool(sessionId, "generate_component");

    // Check if request was cancelled
    if (extra?.signal?.aborted) {
      throw new Error("Request was cancelled");
    }

    const prompt = `
You are a senior Front-End engineer who specializes in React 18, TypeScript 5, and modern component architecture.
Your task: **build a reusable ${component_name} component**.

──────────────────────
🔖  Context
──────────────────────
• **Theme:** ${theme}
• **Styling system:** ${styling} (use its idiomatic patterns)
• **Required props:** ${
      props.length
        ? props.map((p) => `\`${p}\``).join(", ")
        : "None – create sensible defaults"
    }

──────────────────────
📦  Deliverables
──────────────────────
1. **\`src/${component_name}.tsx\`** – complete functional component in TypeScript with strict typing.
2. **Styling** – code matching the ***${theme}*** aesthetic, including dark-mode support if relevant.
3. **\`interface ${component_name}Props\`** – each prop documented with concise JSDoc.
4. **Usage example** – minimal yet complete snippet (e.g., in *App.tsx*).
5. **Accessibility** – semantic HTML, ARIA where required, full keyboard support.
6. **Responsive design** – works from 320 px mobile to ≥1440 px desktop.
7. **Best-practice notes** – memoization, composition, sensible defaults, etc.

──────────────────────
📝  Output format (exact format)
──────────────────────
\`\`\`tsx
// 1. Component
...
\`\`\`

⚠️ **No explanatory text** outside the code blocks.
──────────────────────
Additional guidance:
• Assume React ≥18 + TypeScript ≥5 with strict mode.
• Prefer semantic HTML, adding ARIA only when necessary.
• Keep total output under **250 lines**.
• Begin when ready.
`;

    const result = await generateWithOptimalStreaming(prompt, 3000, stream);
    const metrics = performanceTracker.getMetrics(sessionId);

    return {
      content: [
        {
          type: "text",
          text: result.text,
        },
      ],
      _meta: {
        component_name,
        theme,
        styling,
        props_count: props.length,
        streamed: result.streamed,
        chunkCount: result.chunkCount,
        performance_metrics: metrics,
        usage: result.usage,
      },
    };
  } catch (error) {
    logger.error("Component generation failed", error);
    return {
      content: [
        {
          type: "text",
          text: `Error generating component: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ],
      isError: true,
    };
  }
};

// Tool registration object (for MCP server)
export const componentGenerator = {
  name: "generate_component",
  title: "Component Generator",
  description:
    "Generate themed, fully-typed React/Next.js components with Tailwind or other styling options.",
  schema: componentGeneratorSchema,
  outputSchema: componentGeneratorOutputSchema,
  annotations: componentGeneratorAnnotations,
  handler: componentGeneratorHandler,
};

// For compatibility with MCP SDK tool registration
export const componentGeneratorTool = componentGeneratorHandler;
