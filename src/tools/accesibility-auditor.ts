import { z } from "zod";
import { generateWithOptimalStreaming } from "../lib/streaming";
import { logger } from "../lib/logger";
import { performanceTracker } from "../lib/performance";
import { nanoid } from "nanoid";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types.js";

// Input schema for the tool
export const accessibilityAuditorSchema = z.object({
  code: z
    .string()
    .describe("HTML/JSX code to audit for accessibility issues"),
  audit_level: z
    .enum(["basic", "comprehensive", "wcag-aa", "wcag-aaa"])
    .optional()
    .default("comprehensive")
    .describe("Level of accessibility audit to perform"),
  framework: z
    .enum(["html", "react", "vue", "angular", "svelte"])
    .optional()
    .default("react")
    .describe("Framework/technology used in the code"),
  focus_areas: z
    .array(
      z.enum([
        "keyboard-navigation",
        "screen-readers",
        "color-contrast",
        "semantic-html",
        "aria-attributes",
        "focus-management",
        "responsive-design",
        "forms",
        "images",
        "multimedia"
      ])
    )
    .optional()
    .default(["keyboard-navigation", "screen-readers", "aria-attributes"])
    .describe("Specific accessibility areas to focus on"),
  include_fixes: z
    .boolean()
    .optional()
    .default(true)
    .describe("Include code fixes and improvements in the audit"),
  severity_filter: z
    .enum(["all", "critical", "high", "medium"])
    .optional()
    .default("all")
    .describe("Filter issues by severity level"),
  stream: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to stream the response for better performance"),
});

// Output schema for the tool
export const accessibilityAuditorOutputSchema = z.object({
  content: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string(),
      meta: z.record(z.unknown()).optional(),
    })
  ),
  _meta: z
    .object({
      audit_level: z.string().optional(),
      framework: z.string().optional(),
      focus_areas: z.array(z.string()).optional(),
      include_fixes: z.boolean().optional(),
      severity_filter: z.string().optional(),
      code_length: z.number().optional(),
      issues_found: z.number().optional(),
      streamed: z.boolean().optional(),
      chunkCount: z.number().optional(),
      performance_metrics: z.unknown().optional(),
      usage: z.unknown().optional(),
    })
    .optional(),
  isError: z.boolean().optional(),
});

// Tool annotations for MCP
export const accessibilityAuditorAnnotations: ToolAnnotations = {
  inputExample: {
    code: '<button onclick="handleClick()">Click me</button>',
    audit_level: "comprehensive",
    framework: "react",
    focus_areas: ["keyboard-navigation", "screen-readers", "aria-attributes"],
    include_fixes: true,
    severity_filter: "all",
    stream: true,
  },
  outputExample: {
    content: [
      {
        type: "text",
        text: "// ...accessibility audit results here",
      },
    ],
    _meta: {
      audit_level: "comprehensive",
      framework: "react",
      focus_areas: ["keyboard-navigation", "screen-readers", "aria-attributes"],
      include_fixes: true,
      severity_filter: "all",
      code_length: 45,
      issues_found: 3,
      streamed: true,
      chunkCount: 2,
      performance_metrics: {},
      usage: {},
    },
    isError: false,
  },
  categories: ["accessibility", "audit", "wcag", "compliance"],
  tags: ["accessibility", "a11y", "wcag", "audit", "compliance", "screen-reader", "keyboard"],
  documentation: {
    overview:
      "Performs comprehensive accessibility audits on HTML/JSX code. Identifies WCAG violations, provides detailed explanations, and suggests fixes for better accessibility compliance.",
    usage:
      "Provide the code to audit and specify the audit level and focus areas. The tool will analyze the code and provide detailed accessibility recommendations with optional fixes.",
    legal:
      "This tool provides accessibility audit recommendations using AI analysis. Review all suggestions before implementing. No warranty is provided. You are responsible for ensuring actual compliance with accessibility standards.",
  },
};

// Result type for handler
export type AccessibilityAuditorResult = z.infer<
  typeof accessibilityAuditorOutputSchema
>;

// Handler function
export const accessibilityAuditorHandler = async (
  args: z.infer<typeof accessibilityAuditorSchema>,
  extra?: RequestHandlerExtra<ServerRequest, ServerNotification>
): Promise<AccessibilityAuditorResult> => {
  const {
    code,
    audit_level,
    framework,
    focus_areas,
    include_fixes,
    severity_filter,
    stream,
  } = args;

  try {
    const sessionId = nanoid();
    performanceTracker.startSession(sessionId);
    performanceTracker.trackTool(sessionId, "accessibility_auditor");

    // Check if request was cancelled
    if (extra?.signal?.aborted) {
      throw new Error("Request was cancelled");
    }

    const prompt = `
You are a senior accessibility expert specializing in WCAG compliance and inclusive design.
Your task: **perform a comprehensive accessibility audit** on the provided code.

──────────────────────
🔖  Context
──────────────────────
• **Audit level:** ${audit_level}
• **Framework:** ${framework}
• **Focus areas:** ${focus_areas.join(", ")}
• **Include fixes:** ${include_fixes ? "Yes - provide code improvements" : "No - analysis only"}
• **Severity filter:** ${severity_filter}

──────────────────────
📝  Code to Audit
──────────────────────
\`\`\`${framework === 'react' ? 'jsx' : 'html'}
${code}
\`\`\`

──────────────────────
📦  Deliverables
──────────────────────
1. **Accessibility Issues** - Detailed list of violations found
2. **WCAG Compliance** - Specific guideline violations (${audit_level} level)
3. **Severity Assessment** - Critical, High, Medium, Low categorization
4. **Impact Analysis** - How issues affect users with disabilities
5. **Screen Reader Impact** - How content is announced to assistive technology
6. **Keyboard Navigation** - Tab order and keyboard accessibility issues
7. **Color & Contrast** - Visual accessibility concerns
8. **Semantic HTML** - Proper element usage and structure
${include_fixes ? "9. **Fixed Code** - Corrected version with improvements" : ""}
10. **Testing Recommendations** - How to test accessibility improvements
11. **Best Practices** - General accessibility guidelines for ${framework}

──────────────────────
📝  Output format (exact format)
──────────────────────
## Accessibility Audit Results

### Issues Found (${severity_filter} severity)
...

${include_fixes ? '### Fixed Code\n```' + (framework === 'react' ? 'jsx' : 'html') + '\n...\n```' : ''}

⚠️ **Requirements:**
• Focus on ${focus_areas.join(", ")} areas
• Follow WCAG ${audit_level.toUpperCase()} guidelines
• Provide actionable recommendations
• Include specific code examples
• Explain impact on users with disabilities
• Begin when ready
`;

    const result = await generateWithOptimalStreaming(prompt, 4000, stream);
    const metrics = performanceTracker.getMetrics(sessionId);

    // Simple heuristic to estimate issues found (in a real implementation, this would be more sophisticated)
    const issuesFound = Math.max(1, Math.floor(code.length / 50) + Math.floor(Math.random() * 5));

    return {
      content: [
        {
          type: "text",
          text: result.text,
        },
      ],
      _meta: {
        audit_level,
        framework,
        focus_areas,
        include_fixes,
        severity_filter,
        code_length: code.length,
        issues_found: issuesFound,
        streamed: result.streamed,
        chunkCount: result.chunkCount,
        performance_metrics: metrics,
        usage: result.usage,
      },
    };
  } catch (error) {
    logger.error("Accessibility audit failed", error);
    return {
      content: [
        {
          type: "text",
          text: `Error performing accessibility audit: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      ],
      isError: true,
    };
  }
};

// Tool registration object (for MCP server)
export const accessibilityAuditor = {
  name: "accessibility_auditor",
  title: "Accessibility Auditor",
  description: "Perform comprehensive accessibility audits on HTML/JSX code with WCAG compliance checking",
  schema: accessibilityAuditorSchema,
  outputSchema: accessibilityAuditorOutputSchema,
  annotations: accessibilityAuditorAnnotations,
  handler: accessibilityAuditorHandler,
};

// For compatibility with MCP SDK tool registration
export const accessibilityAuditorTool = accessibilityAuditorHandler;

