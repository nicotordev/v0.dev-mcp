import { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const webappGeneratorPrompt: Prompt = {
  name: "create-webapp",
  title: "Web Application Generator",
  description: "Generate complete web applications with AI assistance using modern frameworks and best practices",
  arguments: [
    {
      name: "app_description",
      description: "Description of the web application to generate",
      required: true,
    },
    {
      name: "framework",
      description: "Preferred framework (nextjs, react, vue, svelte)",
      required: false,
    },
    {
      name: "features",
      description: "Specific features to include (comma-separated: authentication, database, api, payments, etc.)",
      required: false,
    },
    {
      name: "styling_system",
      description: "Styling approach (tailwind, styled-components, css-modules, emotion)",
      required: false,
    },
    {
      name: "database_type",
      description: "Database type (postgresql, mysql, sqlite, mongodb, supabase)",
      required: false,
    },
    {
      name: "deployment_target",
      description: "Deployment target (vercel, netlify, aws, docker)",
      required: false,
    },
    {
      name: "include_auth",
      description: "Whether to include authentication (true/false)",
      required: false,
    },
    {
      name: "include_api",
      description: "Whether to include API routes (true/false)",
      required: false,
    },
  ],
}; 