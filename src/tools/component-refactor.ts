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
export const componentRefactorSchema = z.object({
  code: z.string().describe("React component code to refactor"),
  refactor_goals: z
    .array(
      z.enum([
        "performance",
        "accessibility",
        "maintainability",
        "type-safety",
        "modern-patterns",
        "hooks-migration",
        "state-management",
        "testing",
      ])
    )
    .optional()
    .default(["performance", "maintainability", "modern-patterns"])
    .describe("Refactoring goals and focus areas"),
  target_framework: z
    .enum(["react", "next", "remix", "gatsby"])
    .optional()
    .default("react")
    .describe("Target React framework"),
  typescript_level: z
    .enum(["basic", "intermediate", "advanced", "strict"])
    .optional()
    .default("intermediate")
    .describe("TypeScript strictness level"),
  component_type: z
    .enum(["functional", "class", "mixed"])
    .optional()
    .default("functional")
    .describe("Preferred component type"),
  include_tests: z
    .boolean()
    .optional()
    .default(false)
    .describe("Include test refactoring suggestions"),
  preserve_functionality: z
    .boolean()
    .optional()
    .default(true)
    .describe("Ensure functionality remains unchanged"),
  stream: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to stream the response for better performance"),
});

// Output schema for the tool
export const componentRefactorOutputSchema = z.object({
  content: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string(),
      meta: z.record(z.unknown()).optional(),
    })
  ),
  _meta: z
    .object({
      refactor_goals: z.array(z.string()).optional(),
      target_framework: z.string().optional(),
      typescript_level: z.string().optional(),
      component_type: z.string().optional(),
      include_tests: z.boolean().optional(),
      preserve_functionality: z.boolean().optional(),
      code_length: z.number().optional(),
      streamed: z.boolean().optional(),
      chunkCount: z.number().optional(),
      performance_metrics: z.unknown().optional(),
      usage: z.unknown().optional(),
    })
    .optional(),
  isError: z.boolean().optional(),
});

// Tool annotations for MCP
export const componentRefactorAnnotations = {
  inputExample: {
    code: "const MyComponent = () => { return <div>Hello</div>; }",
    refactor_goals: ["performance", "accessibility"],
    target_framework: "react",
    typescript_level: "intermediate",
    component_type: "functional",
    include_tests: false,
    preserve_functionality: true,
    stream: true,
  },
  outputExample: {
    content: [
      {
        type: "text",
        text: "// ...refactored component code here",
      },
    ],
    _meta: {
      refactor_goals: ["performance", "accessibility"],
      target_framework: "react",
      typescript_level: "intermediate",
      component_type: "functional",
      include_tests: false,
      preserve_functionality: true,
      code_length: 55,
      streamed: true,
      chunkCount: 3,
      performance_metrics: {},
      usage: {},
    },
    isError: false,
  },
  categories: ["code-refactoring", "react", "optimization", "typescript"],
  tags: [
    "react",
    "refactor",
    "typescript",
    "performance",
    "accessibility",
    "modernization",
  ],
  documentation: {
    overview:
      "Refactors existing React components for performance, maintainability, type-safety, and accessibility improvements. Supports multiple frameworks and TypeScript levels.",
    usage:
      "Provide the component code and specify refactoring goals. The tool will analyze and improve the code while preserving functionality (unless specified otherwise).",
    legal:
      "This tool refactors code using AI analysis. Review all refactored code before using it in production. No warranty is provided. You are responsible for testing and validating the refactored code.",
  },
};

// Result type for handler
export type ComponentRefactorResult = z.infer<
  typeof componentRefactorOutputSchema
>;

// Handler function
export const componentRefactorHandler = async (
  args: z.infer<typeof componentRefactorSchema>,
  extra?: RequestHandlerExtra<ServerRequest, ServerNotification>
): Promise<ComponentRefactorResult> => {
  const {
    code,
    refactor_goals,
    target_framework,
    typescript_level,
    component_type,
    include_tests,
    preserve_functionality,
    stream,
  } = args;

  try {
    const sessionId = nanoid();
    performanceTracker.startSession(sessionId);
    performanceTracker.trackTool(sessionId, "refactor_component");

    // Check if request was cancelled
    if (extra?.signal?.aborted) {
      throw new Error("Request was cancelled");
    }

    const prompt = `
You are a senior React engineer specializing in code refactoring and modern best practices.
Your task: **refactor the provided React component** for ${target_framework} with focus on: ${refactor_goals.join(
      ", "
    )}.

──────────────────────
🔖  Context
──────────────────────
• **Target framework:** ${target_framework}
• **TypeScript level:** ${typescript_level}
• **Component type:** ${component_type} components preferred
• **Include tests:** ${include_tests ? "Yes" : "No"}
• **Preserve functionality:** ${
      preserve_functionality
        ? "CRITICAL - maintain all existing behavior"
        : "Functionality changes allowed"
    }

──────────────────────
📝  Original Code
──────────────────────
\`\`\`tsx
${code}
\`\`\`

──────────────────────
📦  Deliverables
──────────────────────
1. **Refactored Component** - Modern, optimized version
2. **Key Changes** - Summary of improvements made
3. **Performance Optimizations** - React.memo, useMemo, useCallback usage
4. **Modern Patterns** - Hooks, composition, custom hooks
5. **TypeScript Improvements** - Better typing, interfaces, generics
6. **Accessibility Enhancements** - ARIA attributes, keyboard navigation
7. **Code Organization** - File structure and separation of concerns
8. **State Management** - Optimal state handling patterns
${include_tests ? "9. **Test Updates** - Refactored test suggestions" : ""}
10. **Migration Guide** - Step-by-step refactoring process

──────────────────────
📝  Output format (exact format)
──────────────────────
\`\`\`tsx
// Refactored component
...
\`\`\`

Focus areas: ${refactor_goals.join(", ")}
Ensure compatibility with ${target_framework} best practices.
${preserve_functionality ? "⚠️ **PRESERVE ALL FUNCTIONALITY**" : ""}
`;

    const result = await generateWithOptimalStreaming(prompt, 4500, stream);
    const metrics = performanceTracker.getMetrics(sessionId);

    return {
      content: [
        {
          type: "text",
          text: result.text,
        },
      ],
      _meta: {
        refactor_goals,
        target_framework,
        typescript_level,
        component_type,
        include_tests,
        preserve_functionality,
        code_length: code.length,
        streamed: result.streamed,
        chunkCount: result.chunkCount,
        performance_metrics: metrics,
        usage: result.usage,
      },
    };
  } catch (error) {
    logger.error("Component refactor failed", error);
    return {
      content: [
        {
          type: "text",
          text: `Error refactoring component: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ],
      isError: true,
    };
  }
};

// Tool registration object (for MCP server)
export const componentRefactor = {
  name: "refactor_component",
  title: "Component Refactor",
  description:
    "Refactor existing React components for performance, maintainability, type-safety, and accessibility.",
  schema: componentRefactorSchema,
  outputSchema: componentRefactorOutputSchema,
  annotations: componentRefactorAnnotations,
  handler: componentRefactorHandler,
};

// For compatibility with MCP SDK tool registration
export const componentRefactorTool = componentRefactorHandler;
