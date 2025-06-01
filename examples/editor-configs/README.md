# AI Editor Configurations for v0-mcp-ts

This directory contains optimized configuration files for AI-powered code editors that integrate with the v0-mcp-ts Model Context Protocol server.

## 🎯 Supported Editors

### [Cursor AI](https://cursor.sh/)

A code editor built for pair-programming with AI, featuring advanced autocomplete, chat, and autonomous coding capabilities.

### [Windsurf](https://codeium.com/windsurf)

An AI-native IDE with Cascade and Flow features for autonomous development workflows.

## 📁 Configuration Files

- `cursor-config.json` - Complete Cursor AI configuration
- `windsurf-config.json` - Complete Windsurf IDE configuration

## 🚀 Quick Setup

### Prerequisites

1. **Install v0-mcp-ts server**:

   ```bash
   git clone https://github.com/nicotordev/v0-mcp-ts.git
   cd v0-mcp-ts
   npm install && npm run build
   ```

2. **Get v0dev API Key**:
   - Visit [v0.dev](https://v0.dev)
   - Subscribe to Premium or Team plan
   - Generate API key from dashboard

### Cursor Configuration

1. **Locate Cursor config file**:

   - **macOS**: `~/Library/Application Support/Cursor/User/settings.json`
   - **Windows**: `%APPDATA%\Cursor\User\settings.json`
   - **Linux**: `~/.config/Cursor/User/settings.json`

2. **Copy configuration**:

   ```bash
   cp examples/editor-configs/cursor-config.json ~/.config/Cursor/User/settings.json
   ```

3. **Update paths**:

   - Replace `/absolute/path/to/v0-mcp-ts/dist/index.js` with your actual path
   - Replace `your_v0_api_key_here` with your v0dev API key

4. **Enable YOLO Mode**:
   - Go to Settings → Advanced → Enable YOLO Mode
   - This allows autonomous test execution and build commands

### Windsurf Configuration

1. **Locate Windsurf config**:

   - **macOS**: `~/Library/Application Support/Windsurf/User/settings.json`
   - **Windows**: `%APPDATA%\Windsurf\User\settings.json`
   - **Linux**: `~/.config/Windsurf/User/settings.json`

2. **Copy configuration**:

   ```bash
   cp examples/editor-configs/windsurf-config.json ~/.config/Windsurf/User/settings.json
   ```

3. **Update paths and API key** (same as Cursor)

## 🛠️ Available Tools

Both editors will have access to these v0-mcp-ts tools:

### `generate_webapp`

Generate complete web applications with modern frameworks.

**Usage in Editor**:

```
Create a Next.js e-commerce app with authentication and Stripe payments
```

### `enhance_code`

Improve existing code with AI-powered suggestions.

**Usage in Editor**:

```
Enhance this React component with TypeScript types and error handling
```

### `debug_code`

Debug and fix code issues automatically.

**Usage in Editor**:

```
Debug this async function that's throwing undefined errors
```

### `generate_component`

Create reusable components with proper TypeScript types.

**Usage in Editor**:

```
Generate a responsive Navigation component for React with dropdown menus
```

## ⚡ Cursor-Specific Features

### YOLO Mode

Enables autonomous execution of:

- Test commands (`npm test`, `bun test`, `vitest`)
- Build commands (`tsc`, `npm run build`)
- File operations (`mkdir`, `touch`)
- Linting tools (`eslint`, `prettier`)

### Key Shortcuts

- `Cmd/Ctrl + K` - Quick inline edits
- `Cmd/Ctrl + I` - Open AI chat with context
- `Cmd/Ctrl + Shift + P` → "Bug Finder" - Scan for potential issues

### Workflow Example

```
// 1. Write failing test first
test('should calculate total price with tax', () => {
  expect(calculateTotal(100, 0.08)).toBe(108);
});

// 2. Use Cmd+I and prompt:
"Implement the calculateTotal function to make this test pass"

// 3. AI writes implementation
// 4. YOLO mode automatically runs tests
// 5. AI iterates until tests pass
```

## 🌊 Windsurf-Specific Features

### Cascade

Multi-file editing with dependency awareness:

- Cross-file context understanding
- Automatic dependency tracking
- Coordinated changes across files

### Flow

Autonomous development workflows:

- Planning → Execution → Validation
- Learning from previous iterations
- Self-correcting behavior

### Workflow Example

```
// 1. Describe high-level goal:
"Create a complete user authentication system"

// 2. Flow plans the implementation:
// - Database schema
// - API routes
// - Frontend components
// - Tests

// 3. Cascade executes across multiple files:
// - models/User.ts
// - api/auth.ts
// - components/LoginForm.tsx
// - tests/auth.test.ts

// 4. Validates the complete solution
```

## 🔧 Customization

### Custom Prompts

Both configurations include optimized prompts for:

- Web application generation
- Code enhancement workflows
- Debugging assistance
- Component design patterns

### Framework Preferences

Default settings are optimized for:

- **Language**: TypeScript
- **Framework**: Next.js/React
- **Testing**: Vitest
- **Styling**: Tailwind CSS

## 🐛 Troubleshooting

### Common Issues

1. **MCP Server Not Found**:

   ```bash
   # Ensure server is built
   npm run build

   # Check if dist/index.js exists
   ls -la dist/
   ```

2. **API Key Issues**:

   ```bash
   # Test API key manually
   curl -H "Authorization: Bearer your_api_key" https://api.v0.dev/chat
   ```

3. **Permission Errors**:
   ```bash
   # Make sure script is executable
   chmod +x dist/index.js
   ```

### Debug Mode

Enable debug logging by setting:

```json
{
  "env": {
    "V0_API_KEY": "your_key",
    "DEBUG": "true"
  }
}
```

## 📖 Advanced Usage

### Test-Driven Development

Both editors are configured for TDD workflows:

```
1. Write comprehensive tests first
2. Use AI to implement passing code
3. Iterate until all tests pass
4. Refactor with confidence
```

### Continuous Improvement

Use the `enhance_code` tool regularly:

```
// Select code block and prompt:
"Optimize this code for performance and readability"
"Add proper error handling and logging"
"Convert to TypeScript with strict types"
```

## 🎯 Pro Tips

### For Cursor Users

1. **Use YOLO Mode aggressively** - Let AI handle build/test cycles
2. **Write tests first** - AI performs better with clear specifications
3. **Use terminal integration** - `Cmd+K` in terminal for git shortcuts
4. **Enable commit message generation** - Magic wand in source control

### For Windsurf Users

1. **Trust the Flow** - Let it plan complex multi-file changes
2. **Use Cascade for refactoring** - Cross-file dependencies handled automatically
3. **Leverage workflows** - Pre-defined patterns for common tasks
4. **Iterate with feedback** - Provide context to improve AI decisions

## 🔗 Related Links

- [v0-mcp-ts Documentation](../../README.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Cursor Tips & Tricks](https://www.builder.io/blog/cursor-tips)
- [v0dev API Documentation](https://vercel.com/docs/v0/api)

## 💡 Contributing

Found ways to improve these configurations? Submit a PR with:

- Detailed description of improvements
- Test results with real workflows
- Performance benchmarks if applicable

---

**Happy coding with AI! 🤖✨**
