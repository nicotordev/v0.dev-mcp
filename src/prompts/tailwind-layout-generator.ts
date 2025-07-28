import { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const tailwindLayoutGeneratorPrompt: Prompt = {
  name: "generate-tailwind-layout",
  title: "Tailwind Layout Generator",
  description: "Generate responsive, accessible React/Next.js layout components using Tailwind CSS",
  arguments: [
    {
      name: "layout_name",
      description: "Name of the layout component",
      required: true,
    },
    {
      name: "layout_variants",
      description: "Layout variants to generate (comma-separated: sidebar, header-footer, grid, flex)",
      required: true,
    },
    {
      name: "pages_to_scaffold",
      description: "List of pages to scaffold (comma-separated)",
      required: false,
    },
    {
      name: "include_dark_mode",
      description: "Whether to include dark mode variants (true/false)",
      required: false,
    },
    {
      name: "use_shadcn_ui",
      description: "Whether to leverage shadcn/ui primitives (true/false)",
      required: false,
    },
    {
      name: "responsive_breakpoints",
      description: "Responsive breakpoints to target (comma-separated: sm, md, lg, xl)",
      required: false,
    },
    {
      name: "navigation_type",
      description: "Navigation type (navbar, sidebar, tabs, breadcrumbs)",
      required: false,
    },
  ],
}; 