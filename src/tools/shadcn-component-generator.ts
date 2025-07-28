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

const shadcnComponents = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "calendar",
  "card",
  "carousel",
  "chart",
  "checkbox",
  "collapsible",
  "combobox",
  "command",
  "context-menu",
  "data-table",
  "date-picker",
  "dialog",
  "drawer",
  "dropdown-menu",
  "form",
  "hover-card",
  "input",
  "input-otp",
  "label",
  "menubar",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "slider",
  "sonner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toast",
  "toggle",
  "toggle-group",
  "tooltip",
  "typography",
] as const;

// Input schema for the tool
export const shadcnComponentGeneratorSchema = z.object({
  component_name: z
    .string()
    .describe(
      "Name of the shadcn/ui component to generate (e.g., 'DataTable', 'LoginForm')"
    ),
  component_type: z
    .enum(shadcnComponents)
    .describe("Type of component to generate"),
  shadcn_components: z
    .array(z.string())
    .optional()
    .default(shadcnComponents as unknown as string[])
    .describe(
      "List of shadcn/ui components to use (e.g., ['button', 'card', 'input'])"
    ),
  features: z
    .array(
      z.enum([
        "responsive",
        "dark-mode",
        "validation",
        "accessibility",
        "animations",
        "state-management",
        "typescript",
        "testing",
      ])
    )
    .optional()
    .default(["responsive", "accessibility", "typescript"])
    .describe("Features to include in the component"),
  styling_approach: z
    .enum(["shadcn-default", "custom-variants", "compound-variants"])
    .optional()
    .default("shadcn-default")
    .describe("Styling approach for the component"),
  include_hooks: z
    .boolean()
    .optional()
    .default(true)
    .describe("Include custom React hooks for component logic"),
  stream: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to stream the response for better performance"),
});

// Output schema for the tool
export const shadcnComponentGeneratorOutputSchema = z.object({
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
      component_type: z.string().optional(),
      shadcn_components: z.array(z.string()).optional(),
      features: z.array(z.string()).optional(),
      styling_approach: z.string().optional(),
      include_hooks: z.boolean().optional(),
      streamed: z.boolean().optional(),
      chunkCount: z.number().optional(),
      performance_metrics: z.unknown().optional(),
      usage: z.unknown().optional(),
    })
    .optional(),
  isError: z.boolean().optional(),
});

// Tool annotations for MCP
export const shadcnComponentGeneratorAnnotations = {
  inputExample: {
    component_name: "DataTable",
    component_type: "table",
    shadcn_components: ["table", "button", "input", "dropdown-menu"],
    features: ["responsive", "accessibility", "typescript"],
    styling_approach: "shadcn-default",
    include_hooks: true,
    stream: true,
  },
  outputExample: {
    content: [
      {
        type: "text",
        text: "// ...generated shadcn component code here",
      },
    ],
    _meta: {
      component_name: "DataTable",
      component_type: "table",
      shadcn_components: ["table", "button", "input", "dropdown-menu"],
      features: ["responsive", "accessibility", "typescript"],
      styling_approach: "shadcn-default",
      include_hooks: true,
      streamed: true,
      chunkCount: 5,
      performance_metrics: {},
      usage: {},
    },
    isError: false,
  },
  categories: ["shadcn-ui", "component-generation", "react", "typescript"],
  tags: [
    "shadcn",
    "ui",
    "component",
    "react",
    "typescript",
    "tailwind",
    "accessibility",
  ],
  documentation: {
    overview:
      "Generates sophisticated React components using shadcn/ui primitives. Creates production-ready components with proper TypeScript types, accessibility, and modern patterns.",
    usage:
      "Specify the component name, type, and desired shadcn/ui components to use. The tool generates complete components with proper imports, styling, and functionality.",
    legal:
      "This tool generates shadcn/ui components using AI. Review all generated code before using it in production. No warranty is provided. You are responsible for ensuring the generated components meet your project's requirements.",
  },
};

// Result type for handler
export type ShadcnComponentGeneratorResult = z.infer<
  typeof shadcnComponentGeneratorOutputSchema
>;

// Handler function
export const shadcnComponentGeneratorHandler = async (
  args: z.infer<typeof shadcnComponentGeneratorSchema>,
  extra?: RequestHandlerExtra<ServerRequest, ServerNotification>
): Promise<ShadcnComponentGeneratorResult> => {
  const {
    component_name,
    component_type,
    shadcn_components,
    features,
    styling_approach,
    include_hooks,
    stream,
  } = args;

  try {
    const sessionId = nanoid();
    performanceTracker.startSession(sessionId);
    performanceTracker.trackTool(sessionId, "shadcn_component_generator");

    // Check if request was cancelled
    if (extra?.signal?.aborted) {
      throw new Error("Request was cancelled");
    }

    const prompt = `
You are a senior React developer specializing in shadcn/ui component library and modern UI patterns.
Your task: **build a sophisticated ${component_name} component** using shadcn/ui primitives.

──────────────────────
🔖  Context
──────────────────────
• **Component name:** ${component_name}
• **Component type:** ${component_type}
• **shadcn/ui components:** ${shadcn_components.join(", ")}
• **Features:** ${features.join(", ")}
• **Styling approach:** ${styling_approach}
• **Include custom hooks:** ${include_hooks ? "Yes" : "No"}

──────────────────────
📦  Deliverables
──────────────────────
1. **Main Component** - TypeScript React component using shadcn/ui
2. **Proper Imports** - Correct shadcn/ui component imports
3. **TypeScript Interfaces** - Complete prop types and interfaces
4. **Styling** - ${styling_approach} approach with proper variants
5. **Accessibility** - ARIA attributes, keyboard navigation, screen reader support
6. **Responsive Design** - Mobile-first responsive behavior
${include_hooks ? "7. **Custom Hooks** - Component-specific logic hooks" : ""}
8. **Usage Examples** - Implementation examples and props
9. **Installation Guide** - Required shadcn/ui components to install
10. **Best Practices** - Component composition and patterns

──────────────────────
📝  Output format (exact format)
──────────────────────
\`\`\`tsx
// Component implementation
...
\`\`\`

⚠️ **Requirements:**
• Use shadcn/ui components: ${shadcn_components.join(", ")}
• Assume React ≥18 + TypeScript ≥5 with strict mode
• Follow shadcn/ui patterns and conventions
• Include proper error handling and loading states
• Implement ${features.join(", ")} features
• Keep total output under **350 lines**
• Begin when ready
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
        component_name,
        component_type,
        shadcn_components,
        features,
        styling_approach,
        include_hooks,
        streamed: result.streamed,
        chunkCount: result.chunkCount,
        performance_metrics: metrics,
        usage: result.usage,
      },
    };
  } catch (error) {
    logger.error("shadcn component generation failed", error);
    return {
      content: [
        {
          type: "text",
          text: `Error generating shadcn component: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ],
      isError: true,
    };
  }
};

// Tool registration object (for MCP server)
export const shadcnComponentGenerator = {
  name: "shadcn_component_generator",
  title: "shadcn/ui Component Generator",
  description:
    "Generate sophisticated React components using shadcn/ui primitives with TypeScript and accessibility",
  schema: shadcnComponentGeneratorSchema,
  outputSchema: shadcnComponentGeneratorOutputSchema,
  annotations: shadcnComponentGeneratorAnnotations,
  handler: shadcnComponentGeneratorHandler,
};

// For compatibility with MCP SDK tool registration
export const shadcnComponentGeneratorTool = shadcnComponentGeneratorHandler;
