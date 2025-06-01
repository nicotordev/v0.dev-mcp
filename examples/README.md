# Configuration Examples

This directory contains configuration examples for various MCP clients to use with the v0-mcp-ts server.

## 📁 Available Configurations

### Simple Configurations (Recommended)

- `claude-config.json` - Claude Desktop configuration
- `cursor-config.json` - Cursor AI editor configuration
- `windsurf-config.json` - Windsurf IDE configuration
- `vscode-config.json` - VS Code with MCP extensions

### Advanced Configurations

- `editor-configs/` - Detailed configurations with advanced features

## 🚀 Quick Setup

### 1. Choose Your Client

#### Claude Desktop

```bash
# Copy configuration to Claude Desktop
cp examples/claude-config.json ~/.config/claude/claude_desktop_config.json
```

#### Cursor AI

```bash
# Add to Cursor settings
cp examples/cursor-config.json ~/.cursor/mcp_config.json
```

#### Windsurf IDE

```bash
# Add to Windsurf settings
cp examples/windsurf-config.json ~/.windsurf/mcp_config.json
```

#### VS Code (with MCP extension)

```bash
# Add to VS Code settings
cp examples/vscode-config.json ~/.vscode/mcp_config.json
```

### 2. Update Configuration

Replace the following placeholders in your chosen config file:

- `/absolute/path/to/v0-mcp-ts/dist/index.js` → Your actual server path
- `your_v0_api_key_here` → Your v0.dev API key

### 3. Restart Your Client

Restart your MCP client to load the new configuration.

## 🛠️ Available Tools

Once configured, you'll have access to these tools:

- **`generate_webapp`** - Create complete web applications
- **`enhance_code`** - Improve existing code with AI
- **`debug_code`** - Debug and fix code issues
- **`generate_component`** - Create reusable components

## 📖 Usage Examples

### Generate a Web App

```
Create a Next.js e-commerce application with user authentication, product catalog, shopping cart, and Stripe payment integration
```

### Enhance Code

```
Enhance this React component with TypeScript types, error handling, and accessibility features
```

### Debug Code

```
Debug this async function that's throwing "Cannot read property of undefined" errors
```

### Generate Component

```
Create a responsive navigation component for React with dropdown menus and mobile hamburger menu
```

## 🔧 Troubleshooting

### Server Not Found

```bash
# Ensure the server is built
npm run build

# Check if dist/index.js exists
ls -la dist/index.js
```

### API Key Issues

```bash
# Test your API key
curl -H "Authorization: Bearer your_api_key" https://api.v0.dev/health
```

### Permission Errors

```bash
# Make server executable
chmod +x dist/index.js
```

## 💖 Support This Project

If this project helps you build amazing applications, consider supporting its development:

<p align="center">
  <a href="https://github.com/sponsors/nicotordev">
    <iframe src="https://github.com/sponsors/nicotordev/button" title="Sponsor nicotordev" height="32" width="114" style="border: 0; border-radius: 6px;"></iframe>
  </a>
</p>

**[Become a sponsor](https://github.com/sponsors/nicotordev)** to help maintain and improve this project!

## 🔗 Related Links

- [Main Documentation](../README.md)
- [Development Guide](../DEVELOPMENT.md)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [v0.dev API](https://vercel.com/docs/v0/api)

---

**Built with ❤️ by [Nicolas Torres](https://github.com/nicotordev) in Chile 🇨🇱**
