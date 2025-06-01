# v0-mcp-ts

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)
[![Tests](https://github.com/nicotordev/v0-mcp-ts/workflows/Tests/badge.svg)](https://github.com/nicotordev/v0-mcp-ts/actions)
[![Build](https://github.com/nicotordev/v0-mcp-ts/workflows/Build/badge.svg)](https://github.com/nicotordev/v0-mcp-ts/actions)

> 🚀 **A powerful Model Context Protocol (MCP) server that integrates v0dev AI capabilities for modern web development**

Transform your development workflow with AI-powered web application generation, code enhancement, debugging, and component creation through the standardized MCP protocol.

## ✨ Features

- 🎯 **Complete Web App Generation** - Create full-stack applications with Next.js, React, Vue, Svelte
- 🔧 **Intelligent Code Enhancement** - AI-powered code improvements and optimizations
- 🐛 **Smart Debugging** - Automated error detection and fixes
- 🧩 **Component Generation** - Create reusable, type-safe components
- ⚡ **Real-time Streaming** - Live responses for better UX
- 🔗 **MCP Compatible** - Works with any MCP client (Claude Desktop, Cursor, etc.)
- 🛡️ **Type-Safe** - Full TypeScript support with Zod validation
- 🧪 **Well Tested** - Comprehensive test suite with Vitest

## 🎬 Quick Demo

```bash
# Generate a complete Next.js e-commerce app
mcp-tool generate_webapp --prompt "E-commerce store with shopping cart" --framework nextjs

# Enhance existing code with AI
mcp-tool enhance_code --code "function add(a,b){return a+b}" --enhancement "Add TypeScript types"

# Debug problematic code
mcp-tool debug_code --code "broken code here" --error_message "TypeError: Cannot read property"

# Create reusable components
mcp-tool generate_component --name "UserCard" --description "Profile card component"
```

## 📋 Prerequisites

- **Node.js** 18.0 or higher
- **v0dev API Key** (Premium or Team plan required)
- **TypeScript** 5.0+
- **MCP Client** (Claude Desktop, Cursor, etc.)

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/nicotordev/v0-mcp-ts.git
cd v0-mcp-ts
npm install
```

### 2. Setup

```bash
npm run setup
```

This interactive setup will:

- Configure your v0dev API key
- Build the project
- Run tests
- Generate MCP client configuration

### 3. Configuration

#### For Claude Desktop

Copy the generated configuration to your Claude Desktop config:

```json
{
  "mcpServers": {
    "v0-mcp-ts": {
      "command": "node",
      "args": ["/absolute/path/to/v0-mcp-ts/dist/index.js"],
      "env": {
        "V0_API_KEY": "your_v0_api_key_here"
      }
    }
  }
}
```

#### For Other MCP Clients

The server uses standard stdio transport, making it compatible with any MCP client.

## 🛠️ Available Tools

### `generate_webapp`

Create complete web applications with AI assistance.

**Parameters:**

- `prompt` (string) - Description of the application to generate
- `framework` (optional) - Target framework: `nextjs`, `react`, `vue`, `svelte`
- `features` (optional) - Array of required features
- `stream` (optional) - Enable streaming responses

**Example:**

```json
{
  "name": "generate_webapp",
  "arguments": {
    "prompt": "Real-time chat application with authentication",
    "framework": "nextjs",
    "features": ["authentication", "database", "websockets"],
    "stream": false
  }
}
```

### `enhance_code`

Improve existing code with AI-powered suggestions.

**Parameters:**

- `code` (string) - Code to enhance
- `enhancement` (string) - Description of desired improvements
- `language` (optional) - Programming language (default: typescript)

### `debug_code`

Debug and fix code issues automatically.

**Parameters:**

- `code` (string) - Code with issues
- `error_message` (optional) - Error message if available
- `language` (optional) - Programming language (default: typescript)

### `generate_component`

Create reusable components with proper TypeScript types.

**Parameters:**

- `component_name` (string) - Name of the component
- `description` (string) - Component functionality description
- `framework` (optional) - Component framework: `react`, `vue`, `svelte`
- `props` (optional) - Component props specification

## 📚 Resources

### `v0-api-docs`

Access comprehensive v0dev API documentation and best practices.

**URI:** `v0://api-docs`

## 💡 Prompts

### `create-webapp`

Predefined template for generating web applications with specific requirements.

## 🧪 Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Development Mode

```bash
# Start development server with auto-reload
npm run dev
```

### Building

```bash
# Build for production
npm run build

# Clean build artifacts
npm run clean
```

## 🏗️ API Limits

- **Daily Requests:** 200 messages per day
- **Context Window:** 128,000 tokens
- **Output Limit:** 32,000 tokens
- **Plan Required:** v0dev Premium or Team

## 🤝 Contributing

We welcome contributions! Please see our [Development Guide](DEVELOPMENT.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Nicolas Torres**

- 🌍 Location: Chile
- 🐙 GitHub: [@nicotordev](https://github.com/nicotordev)
- 💼 LinkedIn: [nicotordev](https://www.linkedin.com/in/nicotordev/)
- 🎥 YouTube: [NicoTorDev Channel](https://www.youtube.com/channel/UCcOj4lCqvmND56JDz1ZMWuA)

Full Stack Web Developer specializing in Node.js, React.js, Next.js, Vue.js, and modern web technologies.

## 🔗 Links

- 📖 [MCP Documentation](https://modelcontextprotocol.io/)
- 🎨 [v0dev API](https://vercel.com/docs/v0/api)
- 🧠 [AI SDK](https://sdk.vercel.ai/)
- 🏗️ [TypeScript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## 🌟 Show Your Support

If this project helped you, please give it a ⭐ on GitHub!

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/nicotordev">Nicolas Torres</a> in Chile 🇨🇱</sub>
</p>
