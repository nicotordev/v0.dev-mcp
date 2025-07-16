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
export const cssThemeGeneratorSchema = z.object({
  theme_name: z
    .string()
    .describe("Human-readable name for the theme, e.g. 'Corporate Blue'"),
  primary_color: z
    .string()
    .regex(/^#?([0-9a-fA-F]{3,8})$/, {
      message: "Provide a valid hex color like #1d4ed8 or 1d4ed8",
    })
    .describe("Primary brand color in HEX format (3-8 digits)"),
  secondary_color: z
    .string()
    .regex(/^#?([0-9a-fA-F]{3,8})$/, {
      message: "Provide a valid hex color like #9333ea or 9333ea",
    })
    .optional()
    .describe("Secondary accent color in HEX format"),
  neutral_color: z
    .string()
    .regex(/^#?([0-9a-fA-F]{3,8})$/)
    .optional()
    .describe("Neutral (background) color in HEX format"),
  border_radius: z
    .string()
    .optional()
    .default("0.5rem")
    .describe("Border radius to apply across components (e.g. '0.5rem')"),
  generate_tailwind_config: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to generate a Tailwind theme.extend configuration"),
  output_format: z
    .enum(["css-vars", "tailwind-config", "both"])
    .optional()
    .default("css-vars")
    .describe("Desired output format for the theme tokens"),
  stream: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to stream the response for better performance"),
});

// Output schema for the tool
export const cssThemeGeneratorOutputSchema = z.object({
  content: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string(),
      meta: z.record(z.unknown()).optional(),
    })
  ),
  _meta: z
    .object({
      theme_name: z.string().optional(),
      primary_color: z.string().optional(),
      secondary_color: z.string().optional(),
      neutral_color: z.string().optional(),
      border_radius: z.string().optional(),
      output_format: z.string().optional(),
      generate_tailwind_config: z.boolean().optional(),
      streamed: z.boolean().optional(),
      chunkCount: z.number().optional(),
      performance_metrics: z.unknown().optional(),
      usage: z.unknown().optional(),
    })
    .optional(),
  isError: z.boolean().optional(),
});

// Tool annotations for MCP
export const cssThemeGeneratorAnnotations = {
  inputExample: {
    theme_name: "Corporate Blue",
    primary_color: "#1d4ed8",
    secondary_color: "#9333ea",
    neutral_color: "#f8fafc",
    border_radius: "0.5rem",
    generate_tailwind_config: true,
    output_format: "both",
    stream: true,
  },
  outputExample: {
    content: [
      {
        type: "text",
        text: "// ...generated theme code here",
      },
    ],
    _meta: {
      theme_name: "Corporate Blue",
      primary_color: "#1d4ed8",
      secondary_color: "#9333ea",
      neutral_color: "#f8fafc",
      border_radius: "0.5rem",
      output_format: "both",
      generate_tailwind_config: true,
      streamed: true,
      chunkCount: 3,
      performance_metrics: {},
      usage: {},
    },
    isError: false,
  },
  categories: ["theme-generation", "css", "tailwind", "design-tokens"],
  tags: ["css", "theme", "tailwind", "design-tokens", "colors", "accessibility"],
  documentation: {
    overview:
      "Generates accessible CSS/Tailwind themes with design tokens, color palettes, and configuration. Supports CSS variables and Tailwind config formats.",
    usage:
      "Provide theme name and primary color (minimum). Optional secondary and neutral colors enhance the palette. Choose output format and Tailwind config generation.",
    legal:
      "This tool generates theme code using AI. Review all generated code before using it in production. No warranty is provided. You are responsible for ensuring the generated themes meet your project's design requirements.",
  },
};

// Result type for handler
export type CssThemeGeneratorResult = z.infer<
  typeof cssThemeGeneratorOutputSchema
>;

// Handler function
export const cssThemeGeneratorHandler = async (
  args: z.infer<typeof cssThemeGeneratorSchema>,
  extra?: RequestHandlerExtra<ServerRequest, ServerNotification>
): Promise<CssThemeGeneratorResult> => {
  const {
    theme_name,
    primary_color,
    secondary_color,
    neutral_color,
    border_radius,
    generate_tailwind_config,
    output_format,
    stream,
  } = args;

  try {
    const sessionId = nanoid();
    performanceTracker.startSession(sessionId);
    performanceTracker.trackTool(sessionId, "css_theme_generator");

    // Check if request was cancelled
    if (extra?.signal?.aborted) {
      throw new Error("Request was cancelled");
    }

    const prompt = `
You are a senior UI/UX designer specializing in design systems and accessible color palettes.
Your task: **design a modern, accessible CSS theme** called "${theme_name}".

──────────────────────
🔖  Context
──────────────────────
• **Theme name:** ${theme_name}
• **Primary color:** ${primary_color}
${secondary_color ? `• **Secondary color:** ${secondary_color}` : ""}
${neutral_color ? `• **Neutral color:** ${neutral_color}` : ""}
• **Border radius:** ${border_radius}
• **Output format:** ${output_format}
• **Generate Tailwind config:** ${generate_tailwind_config ? "Yes" : "No"}

──────────────────────
📦  Deliverables
──────────────────────
1. **Design tokens** - Scalable color palette, radius, shadows, typography
2. **Accessible colors** - AA & AAA contrast ratios with examples
3. **Theme format** - ${output_format} format as requested
${generate_tailwind_config ? "4. **Tailwind config** - theme.extend configuration snippet" : ""}
5. **Usage examples** - React + Tailwind implementation samples
6. **Dark mode strategy** - prefers-color-scheme and implementation
7. **Color variations** - Light/dark variants and semantic colors
8. **Documentation** - Implementation guide and best practices

──────────────────────
📝  Output format (exact format)
──────────────────────
\`\`\`css
/* Theme tokens */
...
\`\`\`

⚠️ **Requirements:**
• Ensure WCAG AA compliance (4.5:1 contrast ratio minimum)
• Provide semantic color names (success, warning, error, info)
• Include hover/focus states
• Keep code snippets minimal and ready to paste
• Generate complete, production-ready theme
`;

    const result = await generateWithOptimalStreaming(prompt, 3500, stream);
    const metrics = performanceTracker.getMetrics(sessionId);

    return {
      content: [
        {
          type: "text",
          text: result.text,
        },
      ],
      _meta: {
        theme_name,
        primary_color,
        secondary_color,
        neutral_color,
        border_radius,
        output_format,
        generate_tailwind_config,
        streamed: result.streamed,
        chunkCount: result.chunkCount,
        performance_metrics: metrics,
        usage: result.usage,
      },
    };
  } catch (error) {
    logger.error("CSS Theme generation failed", error);
    return {
      content: [
        {
          type: "text",
          text: `Error generating CSS theme: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ],
      isError: true,
    };
  }
};

// Tool registration object (for MCP server)
export const cssThemeGenerator = {
  name: "css_theme_generator",
  title: "CSS Theme Generator",
  description: "Generate accessible CSS/Tailwind themes with design tokens and samples",
  schema: cssThemeGeneratorSchema,
  outputSchema: cssThemeGeneratorOutputSchema,
  annotations: cssThemeGeneratorAnnotations,
  handler: cssThemeGeneratorHandler,
};

// For compatibility with MCP SDK tool registration
export const cssThemeGeneratorTool = cssThemeGeneratorHandler;
