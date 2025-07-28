# v0-mcp-ts

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.2+-black.svg)](https://bun.sh/)
[![Tests](https://github.com/nicotordev/v0-mcp-ts/workflows/Tests/badge.svg)](https://github.com/nicotordev/v0-mcp-ts/actions)
[![Build](https://github.com/nicotordev/v0-mcp-ts/workflows/Build/badge.svg)](https://github.com/nicotordev/v0-mcp-ts/actions)
[![smithery badge](https://smithery.ai/badge/@nicotordev/v0-dev-mcp)](https://smithery.ai/server/@nicotordev/v0-dev-mcp)

> The Ultimate Model Context Protocol (MCP) Server for AI-Powered Web Development, designed to bridge the gap between **design** and **code**.

**v0-mcp-ts** is a powerful, high-performance MCP server built with **Bun** and **TypeScript**. It integrates directly with **v0.dev**, a generative UI platform by **Vercel**, to bring AI-powered design and development to your workflow. Seamlessly generate UI from text prompts, iterate on designs like you would in Figma, and get production-ready code for modern web frameworks.

This server is your copilot for turning ideas into beautiful, functional, and accessible user interfaces.

<p align="center">
  <img src="https://raw.githubusercontent.com/nicotordev/v0-mcp-ts/main/assets/v0-mcp-ts-demo.png" alt="v0-mcp-ts Demo" width="800">
</p>

---

## ✨ Key Features

- **🚀 High-Performance**: Built on **Bun**, providing a 25x faster development experience.
- **🎨 Design-to-Code**: Leverages **v0.dev** to generate UI from text prompts and design iterations.
- **🧩 Component Generation**: Create reusable components for **React**, **Vue**, **Svelte**, and more.
- **💅 Styling & Theming**: Generate Tailwind CSS layouts and CSS-in-JS themes.
- **♿ Accessibility Audits**: Ensure your components are WCAG compliant.
- **🔧 Code Refactoring**: Improve existing components with AI-powered suggestions.
- **✅ Type-Safe**: Written in **TypeScript** with strict type checking using **Zod**.
- **🧪 Comprehensive Testing**: Includes a full suite of tests with **Vitest**.

---

## 🛠️ Tools Arsenal

This MCP server comes packed with a suite of tools to supercharge your development process:

| Tool                         | Description                                            | Key Features                                          |
| ---------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `generate_component`         | Complete web component generation                      | React, Vue, Svelte support, TypeScript, Props         |
| `generate_shadcn_component`  | Create components using the shadcn/ui library          | Leverages shadcn/ui primitives, variants, custom CSS  |
| `generate_tailwind_layout`   | Generate responsive layouts with Tailwind CSS          | Sidebar, Header/Footer, Grid, Flex, Dark Mode         |
| `generate_css_theme`         | Design accessible CSS themes                           | WCAG AA compliance, CSS Vars, Tailwind Config         |
| `refactor_component`         | Refactor components with best practices                | Performance, Accessibility, Typing, Modern Patterns   |
| `audit_accessibility`        | Comprehensive accessibility audit for your code        | WCAG compliance, screen-reader, keyboard navigation |

---

## 💡 Prompts for Every Need

Use these prompts to guide the AI in generating exactly what you need:

| Prompt                       | Description                                         | Use Case                                                    |
| ---------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `component-generator`        | Generate React components with TypeScript           | Create new UI components from scratch.                      |
| `shadcn-component-generator` | Generate components using shadcn/ui                 | Build complex UIs with a trusted component library.         |
| `tailwind-layout-generator`  | Generate responsive layouts with Tailwind CSS       | Scaffold page layouts and responsive designs.               |
| `css-theme-generator`        | Generate accessible CSS themes                      | Create a consistent design system and color palette.        |
| `component-refactor`         | Refactor React components with best practices       | Improve code quality, performance, and accessibility.       |
| `accessibility-auditor`      | Comprehensive accessibility audit tool              | Ensure your application is usable by everyone.              |
| `webapp-generator`           | Generate complete web applications                  | Kickstart a new project with a solid foundation.            |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Bun** v1.2.0+
- **v0.dev API Key**
- An MCP Client (e.g., Cursor)
=======
### Installing via Smithery

To install v0-dev-mcp for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@nicotordev/v0-dev-mcp):

```bash
npx -y @smithery/cli install @nicotordev/v0-dev-mcp --client claude
```

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/nicotordev/v0-mcp-ts.git
cd v0-mcp-ts

# Install dependencies with Bun
bun install

# Run the interactive setup
bun run setup
```

### 3. Configuration

Configure your MCP client to connect to the server. Here's an example for Cursor:

```jsonc
// settings.json
{
  "mcp.servers": {
    "v0-mcp-ts": {
      "command": "bun",
      "args": ["run", "dev"],
      "cwd": "/path/to/your/v0-mcp-ts",
      "env": {
        "V0_API_KEY": "your-v0-api-key"
      }
    }
  }
}
```

---

## 🎬 Usage Examples

### Generate a new Component

```json
{
  "tool": "generate_component",
  "arguments": {
    "component_name": "UserProfileCard",
    "component_description": "A card to display user information with an avatar, name, and bio.",
    "theme": "dark",
    "styling_system": "tailwind"
  }
}
```

### Refactor an existing Component

```json
{
  "tool": "refactor_component",
  "arguments": {
    "code": "/* your existing component code here */",
    "focus_areas": "performance,accessibility"
  }
}
```

### Audit for Accessibility

```json
{
  "tool": "audit_accessibility",
  "arguments": {
    "code": "/* your JSX/HTML code here */",
    "audit_level": "wcag-aa"
  }
}
```

---

## 🏗️ Supported Technologies

- **Frontend Frameworks**: Next.js, React, Vue, Svelte, Angular
- **Styling**: Tailwind CSS, CSS Modules, Styled Components, Emotion
- **Testing**: Vitest, Jest, Cypress, Playwright

---

## 🧪 Development & Testing

```bash
# Run development server with hot reload
bun run dev

# Run all tests
bun test

# Run tests with coverage report
bun run test:coverage

# Type-check the codebase
bun run type-check
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

1. **Fork** the repository.
2. Create a new feature branch: `git checkout -b feature/your-amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/your-amazing-feature`
5. Open a **Pull Request**.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Nicolas Torres**
- 🌍 **Location**: Chile
- 🐙 **GitHub**: [@nicotordev](https://github.com/nicotordev)
- 💼 **LinkedIn**: [nicotordev](https://www.linkedin.com/in/nicotordev/)
- 🎥 **YouTube**: [NicoTorDev Channel](https://www.youtube.com/channel/UCcOj4lCqvmND56JDz1ZMWuA)

A Full Stack Developer from Chile, passionate about modern web technologies, AI integration, and building high-performance applications.

---

## 🌟 Show Your Support

If this project helps you build amazing things, please give it a ⭐ on GitHub!

<p align="center">
  <a href="https://github.com/sponsors/nicotordev">
    <img src="https://img.shields.io/badge/Sponsor-GitHub-pink?style=for-the-badge&logo=github" alt="GitHub Sponsors">
  </a>
</p>

---

<p align="center">
  <sub>Built with ❤️ and ⚡ Bun by <a href="https://github.com/nicotordev">Nicolas Torres</a> in Chile 🇨🇱</sub>
</p>
