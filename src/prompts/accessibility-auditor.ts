import { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const accessibilityAuditorPrompt: Prompt = {
  name: "audit-accessibility",
  title: "Accessibility Auditor",
  description: "Perform comprehensive accessibility audits on HTML/JSX code with WCAG compliance analysis",
  arguments: [
    {
      name: "code",
      description: "The HTML/JSX code to audit for accessibility issues",
      required: true,
    },
    {
      name: "audit_level",
      description: "Level of audit detail (basic, comprehensive, wcag-aa, wcag-aaa)",
      required: false,
    },
    {
      name: "framework",
      description: "Framework context (react, vue, angular, html)",
      required: false,
    },
    {
      name: "focus_areas",
      description: "Specific areas to focus on (comma-separated: keyboard, screen-reader, color-contrast, semantic-html)",
      required: false,
    },
    {
      name: "include_fixes",
      description: "Whether to provide corrected code (true/false)",
      required: false,
    },
    {
      name: "severity_filter",
      description: "Filter issues by severity (critical, high, medium, low, all)",
      required: false,
    },
  ],
}; 