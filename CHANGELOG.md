# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **⚡ Bun Runtime Migration** - Migrated from npm to Bun for 25x faster performance
- **Enhanced CI/CD Pipeline** - Updated GitHub Actions to use Bun for all operations
- **Bun Audit Integration** - Added `bun audit` for security vulnerability scanning (v1.2.15+)
- **@vitest/coverage-v8** - Improved test coverage reporting with v8 provider
- **Performance Documentation** - Added Bun-specific commands and performance benefits guide
- Initial project setup and architecture
- MCP server implementation with v0dev integration
- Four core tools: `generate_webapp`, `enhance_code`, `debug_code`, `generate_component`
- Resource for v0dev API documentation
- Prompt template for web app generation
- Comprehensive test suite with Vitest
- Docker support with multi-stage builds
- Development and production Docker Compose configurations
- Interactive setup script
- TypeScript support with strict type checking
- Zod validation for all tool parameters
- Real-time streaming support
- Professional documentation and development guide

### Changed

- **⚡ Package Manager** - Switched from npm to Bun for all package management operations
- **🚀 GitHub Actions** - Updated CI/CD workflow to use `oven-sh/setup-bun@v2` action
- **📦 Dependencies** - Added `@vitest/coverage-v8` for better coverage reporting
- **🔧 Build Process** - Optimized build and test scripts to use Bun's native capabilities
- **📚 Documentation** - Updated all documentation to reflect Bun migration
- **🛠️ Development Workflow** - Enhanced development experience with Bun's hot reload
- Project renamed from `v0dev-mcp` to `v0-mcp-ts`
- Documentation fully translated to English
- Added author information and professional branding

### Performance

- **25x faster** package installation compared to npm
- **Native TypeScript support** without transpilation overhead
- **Built-in test runner** with Jest compatibility for faster test execution
- **Hot reload** with native watch mode for improved development experience
- **Optimized bundling** and dependency resolution

### Security

- **Enhanced Security Auditing** - Implemented `bun audit` for dependency vulnerability scanning
- **Secure CI/CD** - Updated GitHub Actions with proper Bun security practices
- Implemented secure environment variable handling
- Added proper Docker security practices
- CodeQL security scanning in CI

## [1.0.0] - 2025-01-XX

### Added

- **🚀 Bun-Powered Performance** - Complete migration to Bun runtime for optimal performance
- **⚡ Lightning Fast Operations** - 25x faster package management and build processes
- **🔒 Enhanced Security** - Modern security auditing with bun audit
- Initial release of v0-mcp-ts
- Full Model Context Protocol implementation
- Integration with v0dev AI API
- TypeScript SDK with comprehensive type safety
- Production-ready Docker containers
- Automated CI/CD pipeline with Bun
- Professional documentation

### Technical Improvements

- **Runtime**: Migrated from Node.js/npm to Bun for superior performance
- **Testing**: Enhanced test coverage with @vitest/coverage-v8 provider
- **CI/CD**: Streamlined GitHub Actions workflow using official Bun action
- **Dependencies**: Optimized dependency management with bun.lock
- **Development**: Improved hot reload and watch mode capabilities

---

## Release Notes Template

### [Version] - YYYY-MM-DD

#### Added

- New features and capabilities

#### Changed

- Changes in existing functionality

#### Performance

- Performance improvements and optimizations

#### Deprecated

- Soon-to-be removed features

#### Removed

- Removed features

#### Fixed

- Bug fixes and issue resolutions

#### Security

- Security improvements and vulnerability fixes
