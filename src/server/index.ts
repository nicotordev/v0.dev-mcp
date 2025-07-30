// Core MCP SDK imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { nanoid } from "nanoid";

// Internal utilities
import { logger } from "../lib/logger";
import { performanceTracker } from "../lib/performance";
import { V0_API_KEY } from "../config/vercel";

// Tools
import {
  componentGenerator,
  componentGeneratorTool,
} from "../tools/component-generator";
import { accessibilityAuditor } from "../tools/accesibility-auditor";
import { shadcnComponentGenerator } from "../tools/shadcn-component-generator";
import { tailwindLayoutGenerator } from "../tools/tailwind-layout-generator";
import { cssThemeGenerator } from "../tools/css-theme-generator";
import { componentRefactor } from "../tools/component-refactor";

// Resources
import { apiDocsResource } from "../resources/apiDocs";
import { performanceMetricsResource } from "../resources/performanceMetrics";

// Prompts
import { accessibilityAuditorPrompt } from "../prompts/accessibility-auditor";
import { componentGeneratorPrompt } from "../prompts/component-generator";
import { componentRefactorPrompt } from "../prompts/component-refactor";
import { cssThemeGeneratorPrompt } from "../prompts/css-theme-generator";
import { shadcnComponentGeneratorPrompt } from "../prompts/shadcn-component-generator";
import { tailwindLayoutGeneratorPrompt } from "../prompts/tailwind-layout-generator";
import { webappGeneratorPrompt } from "../prompts/webapp-generator";

// Server configuration
const SERVER_CONFIG = {
  name: "v0-mcp-ts",
  version: "2.0.0",
  description:
    "An advanced MCP server with v0.dev AI integration for frontend UI generation, React component creation, performance optimization, and modern web development workflows",
} as const;

// Create the enhanced MCP server with optimized configuration
const server = new McpServer(SERVER_CONFIG, {
  capabilities: {
    tools: {},
    prompts: {},
    resources: {},
  },
  // Enable notification debouncing for better performance
  debouncedNotificationMethods: [
    "notifications/tools/list_changed",
    "notifications/resources/list_changed",
    "notifications/prompts/list_changed",
  ],
});

// ============================================================================
// PROMPT REGISTRATION
// ============================================================================

/**
 * Register accessibility auditor prompt with schema validation
 */
function registerAccessibilityAuditorPrompt() {
  server.registerPrompt(
    accessibilityAuditorPrompt.name,
    {
      title: accessibilityAuditorPrompt.title || "Accessibility Auditor",
      description:
        accessibilityAuditorPrompt.description ||
        "Comprehensive accessibility audit tool",
      argsSchema: {
        code: z
          .string()
          .describe("The HTML/JSX code to audit for accessibility issues"),
        audit_level: z
          .string()
          .optional()
          .describe(
            "Level of audit detail (basic, comprehensive, wcag-aa, wcag-aaa)"
          ),
        framework: z
          .string()
          .optional()
          .describe("Framework context (react, vue, angular, html)"),
        focus_areas: z
          .string()
          .optional()
          .describe(
            "Specific areas to focus on (comma-separated: keyboard, screen-reader, color-contrast, semantic-html)"
          ),
        include_fixes: z
          .string()
          .optional()
          .describe("Whether to provide corrected code (true/false)"),
        severity_filter: z
          .string()
          .optional()
          .describe(
            "Filter issues by severity (critical, high, medium, low, all)"
          ),
      },
    },
    ({
      code,
      audit_level = "comprehensive",
      framework = "react",
      focus_areas = "all",
      include_fixes = "true",
      severity_filter = "all",
    }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are a senior accessibility expert specializing in WCAG compliance and inclusive design.
Your task: **perform a comprehensive accessibility audit** on the provided code.

──────────────────────
🔖  Context
──────────────────────
• **Audit level:** ${audit_level}
• **Framework:** ${framework}
• **Focus areas:** ${focus_areas}
• **Include fixes:** ${include_fixes}
• **Severity filter:** ${severity_filter}

──────────────────────
📝  Code to Audit
──────────────────────
\`\`\`
${code}
\`\`\`

──────────────────────
📦  Deliverables
──────────────────────
1. **Accessibility Issues** - Detailed list of violations found
2. **WCAG Compliance** - Specific guideline violations
3. **Severity Assessment** - Critical, High, Medium, Low categorization
4. **Impact Analysis** - How issues affect users with disabilities
5. **Screen Reader Impact** - How content is announced to assistive technology
6. **Keyboard Navigation** - Tab order and keyboard accessibility issues
7. **Color & Contrast** - Visual accessibility concerns
8. **Semantic HTML** - Proper element usage and structure
9. **Fixed Code** - Corrected version with improvements (if requested)
10. **Testing Recommendations** - How to test accessibility improvements
11. **Best Practices** - General accessibility guidelines

──────────────────────
📝  Output format (exact format)
──────────────────────
## Accessibility Audit Results

### Issues Found
...

### Fixed Code (if requested)
\`\`\`
...
\`\`\`

⚠️ **Requirements:**
• Focus on specified areas
• Follow WCAG guidelines
• Provide actionable recommendations
• Include specific code examples
• Explain impact on users with disabilities
• Begin when ready`,
          },
        },
      ],
    })
  );
}

/**
 * Register component generator prompt with streamlined configuration
 */
function registerComponentGeneratorPrompt() {
  server.registerPrompt(
    componentGeneratorPrompt.name,
    {
      title: componentGeneratorPrompt.title || "Component Generator",
      description:
        componentGeneratorPrompt.description ||
        "Generate React components with TypeScript",
      argsSchema: {
        component_name: z
          .string()
          .describe("Name of the component to generate"),
        component_description: z
          .string()
          .describe("Description of what the component should do"),
        theme: z
          .string()
          .optional()
          .describe("Visual theme or design system to follow"),
        styling_system: z
          .string()
          .optional()
          .describe(
            "Styling approach (tailwind, css-modules, styled-components, emotion)"
          ),
        required_props: z
          .string()
          .optional()
          .describe("List of required props (comma-separated)"),
        optional_props: z
          .string()
          .optional()
          .describe("List of optional props (comma-separated)"),
        features: z
          .string()
          .optional()
          .describe("Specific features to include (comma-separated)"),
      },
    },
    ({
      component_name,
      component_description,
      theme = "modern",
      styling_system = "tailwind",
      required_props = "",
      optional_props = "",
      features = "",
    }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are a senior Front-End engineer who specializes in React 18, TypeScript 5, and modern component architecture.
Your task: **build a reusable component**.

──────────────────────
🔖  Context
──────────────────────
• **Component name:** ${component_name}
• **Description:** ${component_description}
• **Theme:** ${theme}
• **Styling system:** ${styling_system}
• **Required props:** ${required_props}
• **Optional props:** ${optional_props}
• **Features:** ${features}

──────────────────────
📦  Deliverables
──────────────────────
1. **Component file** – complete functional component in TypeScript with strict typing
2. **Styling** – code matching the specified theme aesthetic, including dark-mode support if relevant
3. **Props interface** – each prop documented with concise JSDoc
4. **Usage example** – minimal yet complete snippet
5. **Accessibility** – semantic HTML, ARIA where required, full keyboard support
6. **Responsive design** – works from 320 px mobile to ≥1440 px desktop
7. **Best-practice notes** – memoization, composition, sensible defaults, etc.

──────────────────────
📝  Output format (exact format)
──────────────────────
\`\`\`tsx
// Component implementation
...
\`\`\`

⚠️ **No explanatory text** outside the code blocks.
──────────────────────
Additional guidance:
• Assume React ≥18 + TypeScript ≥5 with strict mode
• Prefer semantic HTML, adding ARIA only when necessary
• Keep total output under **250 lines**
• Begin when ready`,
          },
        },
      ],
    })
  );
}

/**
 * Register web application generator prompt
 */
function registerWebappGeneratorPrompt() {
  server.registerPrompt(
    webappGeneratorPrompt.name,
    {
      title: webappGeneratorPrompt.title || "Web App Generator",
      description:
        webappGeneratorPrompt.description ||
        "Generate complete web applications",
      argsSchema: {
        app_description: z
          .string()
          .describe("Description of the web application to generate"),
        framework: z
          .string()
          .optional()
          .describe("Preferred framework (nextjs, react, vue, svelte)"),
        features: z
          .string()
          .optional()
          .describe(
            "Specific features to include (comma-separated: authentication, database, api, payments, etc.)"
          ),
        styling_system: z
          .string()
          .optional()
          .describe(
            "Styling approach (tailwind, styled-components, css-modules, emotion)"
          ),
        database_type: z
          .string()
          .optional()
          .describe(
            "Database type (postgresql, mysql, sqlite, mongodb, supabase)"
          ),
        deployment_target: z
          .string()
          .optional()
          .describe("Deployment target (vercel, netlify, aws, docker)"),
        include_auth: z
          .string()
          .optional()
          .describe("Whether to include authentication (true/false)"),
        include_api: z
          .string()
          .optional()
          .describe("Whether to include API routes (true/false)"),
      },
    },
    ({
      app_description,
      framework = "nextjs",
      features = "",
      styling_system = "tailwind",
      database_type = "",
      deployment_target = "vercel",
      include_auth = "false",
      include_api = "true",
    }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are an expert full-stack developer specializing in modern web application development.
Your task: **create a complete web application** based on the requirements.

──────────────────────
🔖  Context
──────────────────────
• **Application:** ${app_description}
• **Framework:** ${framework}
• **Features:** ${features}
• **Styling:** ${styling_system}
• **Database:** ${database_type}
• **Deployment:** ${deployment_target}
• **Authentication:** ${include_auth}
• **API Routes:** ${include_api}

──────────────────────
📦  Deliverables
──────────────────────
1. **Project Structure** – Complete folder organization
2. **Core Components** – Main application components
3. **API Routes** – Backend endpoints (if requested)
4. **Database Schema** – Data models and relationships
5. **Authentication** – User management system (if requested)
6. **Configuration** – Environment setup and deployment config
7. **Documentation** – Setup and usage instructions
8. **Best Practices** – Security, performance, and maintainability

──────────────────────
📝  Output format (exact format)
──────────────────────
\`\`\`tsx
// Application code
...
\`\`\`

⚠️ **Requirements:**
• Use modern best practices
• Include proper TypeScript typing
• Implement responsive design
• Follow security guidelines
• Provide production-ready code
• Begin when ready`,
          },
        },
      ],
    })
  );
}

/**
 * Register remaining prompts with consistent patterns
 */
function registerRemainingPrompts() {
  // Component Refactor Prompt
  server.registerPrompt(
    componentRefactorPrompt.name,
    {
      title: componentRefactorPrompt.title || "Component Refactor",
      description:
        componentRefactorPrompt.description ||
        "Refactor React components with best practices",
      argsSchema: {
        code: z.string().describe("The React component code to refactor"),
        target_framework: z
          .string()
          .optional()
          .describe("Target framework (react, next.js, remix)"),
        typescript_level: z
          .string()
          .optional()
          .describe(
            "TypeScript strictness level (basic, strict, ultra-strict)"
          ),
        component_type: z
          .string()
          .optional()
          .describe("Preferred component type (functional, class, auto)"),
        include_tests: z
          .string()
          .optional()
          .describe("Whether to include test refactoring (true/false)"),
        preserve_functionality: z
          .string()
          .optional()
          .describe("Whether to maintain existing behavior (true/false)"),
        focus_areas: z
          .string()
          .optional()
          .describe(
            "Areas to focus on (comma-separated: performance, accessibility, typing, patterns)"
          ),
      },
    },
    ({
      code,
      target_framework = "react",
      typescript_level = "strict",
      component_type = "functional",
      include_tests = "false",
      preserve_functionality = "true",
      focus_areas = "all",
    }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are a senior React engineer specializing in code refactoring and modern best practices.
Your task: **refactor the provided React component** with specified focus areas.

──────────────────────
🔖  Context
──────────────────────
• **Target framework:** ${target_framework}
• **TypeScript level:** ${typescript_level}
• **Component type:** ${component_type}
• **Include tests:** ${include_tests}
• **Preserve functionality:** ${preserve_functionality}
• **Focus areas:** ${focus_areas}

──────────────────────
📝  Original Code
──────────────────────
\`\`\`tsx
${code}
\`\`\`

Focus areas will be specified.
Ensure compatibility with specified framework best practices.
Preserve functionality unless otherwise specified.`,
          },
        },
      ],
    })
  );

  // CSS Theme Generator Prompt
  server.registerPrompt(
    cssThemeGeneratorPrompt.name,
    {
      title: cssThemeGeneratorPrompt.title || "CSS Theme Generator",
      description:
        cssThemeGeneratorPrompt.description || "Generate accessible CSS themes",
      argsSchema: {
        theme_name: z.string().describe("Name of the theme to generate"),
        primary_color: z
          .string()
          .describe("Primary color in HEX format (e.g., #3B82F6)"),
        secondary_color: z
          .string()
          .optional()
          .describe("Secondary color in HEX format"),
        neutral_color: z
          .string()
          .optional()
          .describe("Neutral/base color in HEX format"),
        border_radius: z
          .string()
          .optional()
          .describe("Border radius value (e.g., 8px, 0.5rem)"),
        output_format: z
          .string()
          .optional()
          .describe("Output format (css-vars, tailwind-config, both)"),
        generate_tailwind_config: z
          .string()
          .optional()
          .describe("Whether to include Tailwind configuration (true/false)"),
        include_dark_mode: z
          .string()
          .optional()
          .describe("Whether to include dark mode variants (true/false)"),
      },
    },
    ({
      theme_name,
      primary_color,
      secondary_color = "",
      neutral_color = "",
      border_radius = "0.5rem",
      output_format = "both",
      generate_tailwind_config = "true",
      include_dark_mode = "true",
    }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are a senior UI/UX designer specializing in design systems and accessible color palettes.
Your task: **design a modern, accessible CSS theme**.

──────────────────────
🔖  Context
──────────────────────
• **Theme name:** ${theme_name}
• **Primary color:** ${primary_color}
• **Secondary color:** ${secondary_color}
• **Neutral color:** ${neutral_color}
• **Border radius:** ${border_radius}
• **Output format:** ${output_format}
• **Generate Tailwind config:** ${generate_tailwind_config}
• **Include dark mode:** ${include_dark_mode}

⚠️ **Requirements:**
• Ensure WCAG AA compliance (4.5:1 contrast ratio minimum)
• Provide semantic color names (success, warning, error, info)
• Include hover/focus states
• Keep code snippets minimal and ready to paste
• Generate complete, production-ready theme`,
          },
        },
      ],
    })
  );

  // shadcn Component Generator Prompt
  server.registerPrompt(
    shadcnComponentGeneratorPrompt.name,
    {
      title:
        shadcnComponentGeneratorPrompt.title || "shadcn Component Generator",
      description:
        shadcnComponentGeneratorPrompt.description ||
        "Generate components using shadcn/ui",
      argsSchema: {
        component_name: z
          .string()
          .describe("Name of the component to generate"),
        component_type: z
          .string()
          .describe(
            "Type of component to generate (form, data-display, navigation, feedback)"
          ),
        shadcn_components: z
          .string()
          .describe(
            "List of shadcn/ui components to use (comma-separated: button, input, dialog, etc.)"
          ),
        features: z
          .string()
          .optional()
          .describe(
            "Features to include (comma-separated: validation, loading-states, responsive, etc.)"
          ),
        styling_approach: z
          .string()
          .optional()
          .describe("Styling approach (variants, className, custom-css)"),
        include_custom_hooks: z
          .string()
          .optional()
          .describe("Whether to include custom hooks (true/false)"),
        accessibility_level: z
          .string()
          .optional()
          .describe("Accessibility level (basic, enhanced, wcag-compliant)"),
      },
    },
    ({
      component_name,
      component_type,
      shadcn_components,
      features = "",
      styling_approach = "variants",
      include_custom_hooks = "false",
      accessibility_level = "enhanced",
    }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are a senior React developer specializing in shadcn/ui component library and modern UI patterns.
Your task: **build a sophisticated component** using shadcn/ui primitives.

──────────────────────
🔖  Context
──────────────────────
• **Component name:** ${component_name}
• **Component type:** ${component_type}
• **shadcn/ui components:** ${shadcn_components}
• **Features:** ${features}
• **Styling approach:** ${styling_approach}
• **Include custom hooks:** ${include_custom_hooks}
• **Accessibility level:** ${accessibility_level}

⚠️ **Requirements:**
• Use specified shadcn/ui components
• Assume React ≥18 + TypeScript ≥5 with strict mode
• Follow shadcn/ui patterns and conventions
• Include proper error handling and loading states
• Implement specified features
• Keep total output under **350 lines**
• Begin when ready`,
          },
        },
      ],
    })
  );

  // Tailwind Layout Generator Prompt
  server.registerPrompt(
    tailwindLayoutGeneratorPrompt.name,
    {
      title: tailwindLayoutGeneratorPrompt.title || "Tailwind Layout Generator",
      description:
        tailwindLayoutGeneratorPrompt.description ||
        "Generate responsive layouts with Tailwind CSS",
      argsSchema: {
        layout_name: z.string().describe("Name of the layout component"),
        layout_variants: z
          .string()
          .describe(
            "Layout variants to generate (comma-separated: sidebar, header-footer, grid, flex)"
          ),
        pages_to_scaffold: z
          .string()
          .optional()
          .describe("List of pages to scaffold (comma-separated)"),
        include_dark_mode: z
          .string()
          .optional()
          .describe("Whether to include dark mode variants (true/false)"),
        use_shadcn_ui: z
          .string()
          .optional()
          .describe("Whether to leverage shadcn/ui primitives (true/false)"),
        responsive_breakpoints: z
          .string()
          .optional()
          .describe(
            "Responsive breakpoints to target (comma-separated: sm, md, lg, xl)"
          ),
        navigation_type: z
          .string()
          .optional()
          .describe("Navigation type (navbar, sidebar, tabs, breadcrumbs)"),
      },
    },
    ({
      layout_name,
      layout_variants,
      pages_to_scaffold = "",
      include_dark_mode = "true",
      use_shadcn_ui = "false",
      responsive_breakpoints = "sm,md,lg,xl",
      navigation_type = "navbar",
    }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are a senior Front-End engineer specializing in responsive layout design with Tailwind CSS.
Your task: **build a responsive, accessible layout component**.

──────────────────────
🔖  Context
──────────────────────
• **Layout name:** ${layout_name}
• **Layout variants:** ${layout_variants}
• **Pages to scaffold:** ${pages_to_scaffold}
• **Dark mode:** ${include_dark_mode}
• **Use shadcn/ui:** ${use_shadcn_ui}
• **Responsive breakpoints:** ${responsive_breakpoints}
• **Navigation type:** ${navigation_type}

⚠️ **Requirements:**
• Assume React ≥18 + TypeScript ≥5 with strict mode
• Use semantic HTML with proper ARIA attributes
• Implement responsive design from 320px to ≥1440px
• Keep total output under **300 lines**
• Begin when ready`,
          },
        },
      ],
    })
  );
}

// ============================================================================
// TOOL REGISTRATION
// ============================================================================

/**
 * Register all tools with consistent error handling and validation
 */
function registerTools() {
  // Component Generator Tool
  server.registerTool(
    componentGenerator.name,
    {
      title: componentGenerator.title,
      description: componentGenerator.description,
      inputSchema: componentGenerator.schema.shape,
    },
    (args, extra) => componentGeneratorTool(args, extra)
  );

  // Component Refactor Tool
  server.registerTool(
    componentRefactor.name,
    {
      title: componentRefactor.title,
      description: componentRefactor.description,
      inputSchema: componentRefactor.schema.shape,
    },
    (args, extra) => componentRefactor.handler(args, extra)
  );

  // shadcn Component Generator Tool
  server.registerTool(
    shadcnComponentGenerator.name,
    {
      title: shadcnComponentGenerator.title,
      description: shadcnComponentGenerator.description,
      inputSchema: shadcnComponentGenerator.schema.shape,
    },
    (args, extra) => shadcnComponentGenerator.handler(args, extra)
  );

  // Accessibility Auditor Tool
  server.registerTool(
    accessibilityAuditor.name,
    {
      title: accessibilityAuditor.title,
      description: accessibilityAuditor.description,
      inputSchema: accessibilityAuditor.schema.shape,
    },
    (args, extra) => accessibilityAuditor.handler(args, extra)
  );

  // Tailwind Layout Generator Tool
  server.registerTool(
    tailwindLayoutGenerator.name,
    {
      title: tailwindLayoutGenerator.title,
      description: tailwindLayoutGenerator.description,
      inputSchema: tailwindLayoutGenerator.schema.shape,
    },
    (args, extra) => tailwindLayoutGenerator.handler(args, extra)
  );

  // CSS Theme Generator Tool
  server.registerTool(
    cssThemeGenerator.name,
    {
      title: cssThemeGenerator.title,
      description: cssThemeGenerator.description,
      inputSchema: cssThemeGenerator.schema.shape,
    },
    (args, extra) => cssThemeGenerator.handler(args, extra)
  );
}

// ============================================================================
// RESOURCE REGISTRATION
// ============================================================================

/**
 * Register all resources with proper metadata
 */
function registerResources() {
  // API Documentation Resource
  server.registerResource(
    apiDocsResource.name,
    apiDocsResource.uri,
    {
      title: "API Documentation",
      description: "Comprehensive API documentation and examples",
      mimeType: "text/markdown",
    },
    apiDocsResource.handler
  );

  // Performance Metrics Resource
  server.registerResource(
    performanceMetricsResource.name,
    performanceMetricsResource.uri,
    {
      title: "Performance Metrics",
      description: "Real-time performance tracking and analytics",
      mimeType: "text/markdown",
    },
    performanceMetricsResource.handler
  );
}

// ============================================================================
// INITIALIZATION AND STARTUP
// ============================================================================

/**
 * Initialize all server components
 */
function initializeServer() {
  registerAccessibilityAuditorPrompt();
  registerComponentGeneratorPrompt();
  registerWebappGeneratorPrompt();
  registerRemainingPrompts();
  registerTools();
  registerResources();
}

/**
 * Setup enhanced error handling with comprehensive logging
 */
function setupErrorHandling() {
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection detected", {
      reason,
      promise: promise.toString(),
    });
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception detected", error);
    process.exit(1);
  });

  // Graceful shutdown handling
  process.on("SIGINT", () => {
    logger.info("Received SIGINT, shutting down gracefully");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.info("Received SIGTERM, shutting down gracefully");
    process.exit(0);
  });
}

// Export the server instance for HTTP wrapper
export { server };

/**
 * Enhanced server startup with comprehensive logging and monitoring
 */
export async function startServer() {
  try {
    logger.info(`Starting ${SERVER_CONFIG.name} v${SERVER_CONFIG.version}...`);

    // Setup error handling first
    setupErrorHandling();

    // Log system information
    logger.info("System Info", {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
    });

    // Validate environment
    if (!V0_API_KEY || V0_API_KEY === "test-mock-key-12345") {
      logger.warn("Using mock API key - real functionality may be limited");
    } else {
      logger.success("v0.dev API key configured");
    }

    // Initialize performance tracking
    const mainSessionId = nanoid();
    performanceTracker.startSession(mainSessionId);

    // Initialize all server components
    initializeServer();

    // Log available tools
    const availableTools = [
      componentGenerator.name,
      componentRefactor.name,
      shadcnComponentGenerator.name,
      accessibilityAuditor.name,
      tailwindLayoutGenerator.name,
      cssThemeGenerator.name,
    ];

    logger.info(
      `Loaded ${availableTools.length} tools:`,
      availableTools.join(", ")
    );

    // Log available resources
    const availableResources = [
      apiDocsResource.name,
      performanceMetricsResource.name,
    ];
    logger.info(
      `Loaded ${availableResources.length} resources:`,
      availableResources.join(", ")
    );

    // Log available prompts
    const availablePrompts = [
      accessibilityAuditorPrompt.name,
      componentGeneratorPrompt.name,
      componentRefactorPrompt.name,
      cssThemeGeneratorPrompt.name,
      shadcnComponentGeneratorPrompt.name,
      tailwindLayoutGeneratorPrompt.name,
      webappGeneratorPrompt.name,
    ];
    logger.info(
      `Loaded ${availablePrompts.length} prompts:`,
      availablePrompts.join(", ")
    );

    // Start the MCP server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    const startupMetrics = performanceTracker.getMetrics(mainSessionId);

    logger.success(`${SERVER_CONFIG.name} started successfully!`);
    logger.info("Server Features", {
      streaming_enabled: true,
      performance_tracking: true,
      enhanced_logging: true,
      prompt_support: true,
      notification_debouncing: true,
      startup_time: `${startupMetrics?.duration || "unknown"}ms`,
    });

    logger.info(
      "Ready to handle MCP requests with enhanced v0.dev AI capabilities"
    );
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}
