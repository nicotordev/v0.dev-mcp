import { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const shadcnComponentGeneratorPrompt: Prompt = {
  name: "generate-shadcn-component",
  title: "shadcn/ui Component Generator",
  description: "Generate sophisticated React components using shadcn/ui primitives with TypeScript types and accessibility",
  arguments: [
    {
      name: "component_name",
      description: "Name of the component to generate",
      required: true,
    },
    {
      name: "component_type",
      description: "Type of component to generate (form, data-display, navigation, feedback)",
      required: true,
    },
    {
      name: "shadcn_components",
      description: "List of shadcn/ui components to use (comma-separated: button, input, dialog, etc.)",
      required: true,
    },
    {
      name: "features",
      description: "Features to include (comma-separated: validation, loading-states, responsive, etc.)",
      required: false,
    },
    {
      name: "styling_approach",
      description: "Styling approach (variants, className, custom-css)",
      required: false,
    },
    {
      name: "include_custom_hooks",
      description: "Whether to include custom hooks (true/false)",
      required: false,
    },
    {
      name: "accessibility_level",
      description: "Accessibility level (basic, enhanced, wcag-compliant)",
      required: false,
    },
  ],
}; 