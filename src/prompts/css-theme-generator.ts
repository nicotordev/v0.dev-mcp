import { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const cssThemeGeneratorPrompt: Prompt = {
  name: "generate-css-theme",
  title: "CSS Theme Generator",
  description: "Generate accessible CSS/Tailwind themes with design tokens, color palettes, and configuration",
  arguments: [
    {
      name: "theme_name",
      description: "Name of the theme to generate",
      required: true,
    },
    {
      name: "primary_color",
      description: "Primary color in HEX format (e.g., #3B82F6)",
      required: true,
    },
    {
      name: "secondary_color",
      description: "Secondary color in HEX format",
      required: false,
    },
    {
      name: "neutral_color",
      description: "Neutral/base color in HEX format",
      required: false,
    },
    {
      name: "border_radius",
      description: "Border radius value (e.g., 8px, 0.5rem)",
      required: false,
    },
    {
      name: "output_format",
      description: "Output format (css-vars, tailwind-config, both)",
      required: false,
    },
    {
      name: "generate_tailwind_config",
      description: "Whether to include Tailwind configuration (true/false)",
      required: false,
    },
    {
      name: "include_dark_mode",
      description: "Whether to include dark mode variants (true/false)",
      required: false,
    },
  ],
}; 