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
export const tailwindLayoutGeneratorSchema = z.object({
  layout_name: z
    .string()
    .describe("Name for the layout component (e.g., 'DashboardLayout')"),
  pages: z
    .array(z.string())
    .optional()
    .default([])
    .describe("List of top-level pages to scaffold (e.g., ['dashboard','settings'])"),
  layout_variants: z
    .array(
      z.enum([
        "sidebar-left",
        "sidebar-right",
        "header-only",
        "header-footer",
        "split-pane",
        "grid",
      ])
    )
    .optional()
    .default(["header-footer"])
    .describe("Preferred layout variants to generate"),
  dark_mode: z
    .boolean()
    .optional()
    .default(true)
    .describe("Include dark-mode ready classes and examples"),
  use_shadcn: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to leverage shadcn/ui components for primitives (Button, Card, etc.)"),
  stream: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to stream the response for better performance"),
});

// Output schema for the tool
export const tailwindLayoutGeneratorOutputSchema = z.object({
  content: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string(),
      meta: z.record(z.unknown()).optional(),
    })
  ),
  _meta: z
    .object({
      layout_name: z.string().optional(),
      pages_count: z.number().optional(),
      layout_variants: z.array(z.string()).optional(),
      dark_mode: z.boolean().optional(),
      use_shadcn: z.boolean().optional(),
      streamed: z.boolean().optional(),
      chunkCount: z.number().optional(),
      performance_metrics: z.unknown().optional(),
      usage: z.unknown().optional(),
    })
    .optional(),
  isError: z.boolean().optional(),
});

// Tool annotations for MCP
export const tailwindLayoutGeneratorAnnotations = {
  inputExample: {
    layout_name: "DashboardLayout",
    pages: ["dashboard", "settings", "profile"],
    layout_variants: ["sidebar-left", "header-footer"],
    dark_mode: true,
    use_shadcn: false,
    stream: true,
  },
  outputExample: {
    content: [
      {
        type: "text",
        text: "// ...generated layout component code here",
      },
    ],
    _meta: {
      layout_name: "DashboardLayout",
      pages_count: 3,
      layout_variants: ["sidebar-left", "header-footer"],
      dark_mode: true,
      use_shadcn: false,
      streamed: true,
      chunkCount: 4,
      performance_metrics: {},
      usage: {},
    },
    isError: false,
  },
  categories: ["layout-generation", "tailwind", "react", "responsive"],
  tags: ["tailwind", "layout", "responsive", "react", "nextjs", "shadcn", "dark-mode"],
  documentation: {
    overview:
      "Generates responsive, accessible React/Next.js layout components using Tailwind CSS with optional shadcn/ui integration. Supports multiple layout variants and dark mode.",
    usage:
      "Specify the layout name, desired variants, and pages to scaffold. The tool generates complete layout components with navigation, responsive behavior, and accessibility features.",
    legal:
      "This tool generates layout code using AI. Review all generated code before using it in production. No warranty is provided. You are responsible for ensuring the generated layouts meet your project's requirements.",
  },
};

// Result type for handler
export type TailwindLayoutGeneratorResult = z.infer<
  typeof tailwindLayoutGeneratorOutputSchema
>;

// Handler function
export const tailwindLayoutGeneratorHandler = async (
  args: z.infer<typeof tailwindLayoutGeneratorSchema>,
  extra?: RequestHandlerExtra<ServerRequest, ServerNotification>
): Promise<TailwindLayoutGeneratorResult> => {
  const {
    layout_name,
    pages,
    layout_variants,
    dark_mode,
    use_shadcn,
    stream,
  } = args;

  try {
    const sessionId = nanoid();
    performanceTracker.startSession(sessionId);
    performanceTracker.trackTool(sessionId, "tailwind_layout_generator");

    // Check if request was cancelled
    if (extra?.signal?.aborted) {
      throw new Error("Request was cancelled");
    }

    const prompt = `
You are a senior Front-End engineer specializing in responsive layout design with Tailwind CSS.
Your task: **build a responsive, accessible layout component** named "${layout_name}".

──────────────────────
🔖  Context
──────────────────────
• **Layout name:** ${layout_name}
• **Layout variants:** ${layout_variants.join(", ")}
• **Pages to scaffold:** ${pages.length > 0 ? pages.join(", ") : "None"}
• **Dark mode:** ${dark_mode ? "Include dark mode variants" : "Light mode only"}
• **Use shadcn/ui:** ${use_shadcn ? "Leverage shadcn/ui primitives" : "Pure Tailwind CSS"}

──────────────────────
📦  Deliverables
──────────────────────
1. **Layout Component** - TypeScript React component with Tailwind classes
2. **Navigation** - Example navigation bar (mobile & desktop)
3. **Accessibility** - ARIA roles, keyboard navigation hints
4. **Responsive behavior** - Breakpoints for sm, md, lg screens
5. **Page scaffolding** - Boilerplate Next.js pages (${pages.length} entries)
6. **Dark-mode strategy** - tailwind 'dark:' classes & prefers-color-scheme docs
${use_shadcn ? "7. **shadcn integration** - Proper component usage" : ""}
8. **Folder structure** - Suggested project tree
9. **Usage example** - How to wrap pages with ${layout_name}

──────────────────────
📝  Output format (exact format)
──────────────────────
\`\`\`tsx
// Layout component
...
\`\`\`

⚠️ **Requirements:**
• Assume React ≥18 + TypeScript ≥5 with strict mode
• Use semantic HTML with proper ARIA attributes
• Implement responsive design from 320px to ≥1440px
• Keep total output under **300 lines**
• Begin when ready
`;

    const result = await generateWithOptimalStreaming(prompt, 4000, stream);
    const metrics = performanceTracker.getMetrics(sessionId);

    return {
      content: [
        {
          type: "text",
          text: result.text,
        },
      ],
      _meta: {
        layout_name,
        pages_count: pages.length,
        layout_variants,
        dark_mode,
        use_shadcn,
        streamed: result.streamed,
        chunkCount: result.chunkCount,
        performance_metrics: metrics,
        usage: result.usage,
      },
    };
  } catch (error) {
    logger.error("Tailwind layout generation failed", error);
    return {
      content: [
        {
          type: "text",
          text: `Error generating layout: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ],
      isError: true,
    };
  }
};

// Tool registration object (for MCP server)
export const tailwindLayoutGenerator = {
  name: "tailwind_layout_generator",
  title: "Tailwind Layout Generator",
  description: "Generate responsive React/Next.js layout components using Tailwind CSS (optionally shadcn/ui)",
  schema: tailwindLayoutGeneratorSchema,
  outputSchema: tailwindLayoutGeneratorOutputSchema,
  annotations: tailwindLayoutGeneratorAnnotations,
  handler: tailwindLayoutGeneratorHandler,
};

// For compatibility with MCP SDK tool registration
export const tailwindLayoutGeneratorTool = tailwindLayoutGeneratorHandler; 