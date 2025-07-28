import { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const componentGeneratorPrompt: Prompt = {
  name: "generate-component",
  title: "Component Generator",
  description: "Generate a themed, fully-typed React/Next.js component with customizable styling",
  arguments: [
    {
      name: "component_name",
      description: "Name of the component to generate",
      required: true,
    },
    {
      name: "component_description",
      description: "Description of what the component should do",
      required: true,
    },
    {
      name: "theme",
      description: "Visual theme or design system to follow",
      required: false,
    },
    {
      name: "styling_system",
      description: "Styling approach (tailwind, css-modules, styled-components, emotion)",
      required: false,
    },
    {
      name: "required_props",
      description: "List of required props (comma-separated)",
      required: false,
    },
    {
      name: "optional_props",
      description: "List of optional props (comma-separated)",
      required: false,
    },
    {
      name: "features",
      description: "Specific features to include (comma-separated)",
      required: false,
    },
  ],
}; 