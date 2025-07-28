import { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const componentRefactorPrompt: Prompt = {
  name: "refactor-component",
  title: "Component Refactor",
  description: "Refactor React components for performance, maintainability, type-safety, and accessibility improvements",
  arguments: [
    {
      name: "code",
      description: "The React component code to refactor",
      required: true,
    },
    {
      name: "target_framework",
      description: "Target framework (react, next.js, remix)",
      required: false,
    },
    {
      name: "typescript_level",
      description: "TypeScript strictness level (basic, strict, ultra-strict)",
      required: false,
    },
    {
      name: "component_type",
      description: "Preferred component type (functional, class, auto)",
      required: false,
    },
    {
      name: "include_tests",
      description: "Whether to include test refactoring (true/false)",
      required: false,
    },
    {
      name: "preserve_functionality",
      description: "Whether to maintain existing behavior (true/false)",
      required: false,
    },
    {
      name: "focus_areas",
      description: "Areas to focus on (comma-separated: performance, accessibility, typing, patterns)",
      required: false,
    },
  ],
}; 