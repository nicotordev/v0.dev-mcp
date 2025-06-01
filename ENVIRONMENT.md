# Environment Variables Guide

Complete guide for configuring environment variables in v0-mcp-ts.

## 🔧 Required Environment Variables

### 1. Local Development (.env)

```bash
# v0dev API Key (REQUIRED)
V0_API_KEY=your_v0_api_key_here

# Node Environment
NODE_ENV=development

# Debug Mode
DEBUG=false

# Bun Configuration (optional)
BUN_CONFIG_VERBOSE_INSTALL=true  # Verbose logging for dependency installation
BUN_CONFIG_NO_CLEAR_TERMINAL=true  # Keep terminal output during development
```

### 2. Testing (.env.test)

```bash
# Mock API key for tests
V0_API_KEY=test-mock-key-12345

# Test environment
NODE_ENV=test

# Enable debug for tests
DEBUG=true

# Bun Test Configuration
BUN_CONFIG_TEST_TIMEOUT=30000  # Test timeout in milliseconds
```

### 3. Production

Set these via your hosting platform's environment variables:

```bash
# Real v0dev API key
V0_API_KEY=your_production_api_key

# Production environment
NODE_ENV=production

# Disable debug in production
DEBUG=false

# Bun Production Configuration
BUN_CONFIG_PRODUCTION=true
BUN_CONFIG_MINIFY=true
```

## 🚀 GitHub Actions Secrets

Configure these in your GitHub repository settings:

### Required for CI/CD:

- `NPM_TOKEN` - For publishing to npm registry (when using bun publish)
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password
- `V0_API_KEY` - Production v0dev API key

### Optional:

- `CODECOV_TOKEN` - For code coverage reports
- `BUN_AUTH_TOKEN` - For private registry authentication with Bun

## 📋 Setup Instructions

### 1. Get v0dev API Key

1. Visit [v0.dev](https://v0.dev)
2. Subscribe to Premium or Team plan
3. Generate API key from dashboard
4. Copy the key (format: `v1:...`)

### 2. Local Setup with Bun

```bash
# Copy example file
cp .env.example .env

# Edit with your real API key
echo "V0_API_KEY=your_real_key_here" > .env
echo "NODE_ENV=development" >> .env
echo "DEBUG=false" >> .env

# Install dependencies with Bun (25x faster)
bun install
```

### 3. GitHub Secrets Setup

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Add new repository secrets:

   - **NPM_TOKEN**: Your npm publish token
   - **DOCKER_USERNAME**: Your Docker Hub username
   - **DOCKER_PASSWORD**: Your Docker Hub password
   - **V0_API_KEY**: Your production v0dev API key
   - **BUN_AUTH_TOKEN**: (Optional) For private registries

### 4. Verify Security

Run the security check to ensure no secrets are leaked:

```bash
bun run security-check
```

## 🔒 Security Best Practices

### ✅ DO:

- Use `.env` files for local development
- Set production vars via hosting platform
- Use mock keys for testing (`test-mock-key-12345`)
- Run security checks before deployment: `bun audit`
- Keep API keys in GitHub Secrets for CI/CD
- Use `bun.lock` for reproducible dependency installations

### ❌ DON'T:

- Commit `.env` files to git
- Use production keys in development
- Hardcode API keys in source code
- Share API keys in public channels
- Use real keys in test environments
- Ignore `bun audit` security warnings

## 🧪 Testing Environment Variables

For testing, the project automatically uses mock values:

```bash
# Automatically set in CI
V0_API_KEY=test-mock-key-12345
NODE_ENV=test
BUN_CONFIG_TEST_TIMEOUT=30000
```

This ensures tests don't consume your real API quota and don't require actual credentials.

## 🔧 Environment Variable Loading Order

Based on [Next.js environment variables guide](https://nextjs.org/docs/pages/guides/environment-variables), variables are loaded in this order:

1. `process.env`
2. `.env.$(NODE_ENV).local`
3. `.env.local` (ignored in test)
4. `.env.$(NODE_ENV)`
5. `.env`

## ⚡ Bun-Specific Environment Variables

### Development Configuration

```bash
# Enable verbose installation logging
BUN_CONFIG_VERBOSE_INSTALL=true

# Disable terminal clearing during development
BUN_CONFIG_NO_CLEAR_TERMINAL=true

# Set custom registry for private packages
BUN_CONFIG_REGISTRY=https://npm.pkg.github.com/

# Configure maximum concurrent downloads
BUN_CONFIG_NETWORK_CONCURRENCY=48

# Set custom cache directory
BUN_CONFIG_CACHE_DIR=/custom/cache/path
```

### CI/CD Configuration

```bash
# Optimize for CI environment
BUN_CONFIG_CI=true

# Disable interactive prompts
BUN_CONFIG_NO_PROMPT=true

# Enable frozen lockfile (similar to npm ci)
BUN_CONFIG_FROZEN_LOCKFILE=true

# Set authentication token for private registries
BUN_AUTH_TOKEN=${{ secrets.BUN_AUTH_TOKEN }}
```

## 🚨 Troubleshooting

### "V0_API_KEY environment variable is required"

- Ensure `.env` file exists with valid API key
- Check that the key format is correct (`v1:...`)
- Verify the key has proper permissions

### "API quota exceeded"

- You've hit the 200 messages/day limit
- Upgrade your v0dev plan
- Wait for quota reset (daily)

### Tests failing with API errors

- Ensure using mock key: `test-mock-key-12345`
- Check that `NODE_ENV=test` is set
- Verify test environment setup

### Bun installation issues

- Update Bun: `bun upgrade`
- Clear cache: `bun pm cache rm`
- Reinstall dependencies: `rm -rf node_modules bun.lock && bun install`
- Check Bun version: `bun --version` (requires v1.2.0+)

### Private registry authentication

```bash
# Set authentication token
export BUN_AUTH_TOKEN=your_token_here

# Or use .npmrc for compatibility
echo "//npm.pkg.github.com/:_authToken=${BUN_AUTH_TOKEN}" >> .npmrc
```

## 📊 Bun Performance Environment Variables

### Optimization Settings

```bash
# Enable experimental features for better performance
BUN_CONFIG_EXPERIMENTAL=true

# Use system allocator for large projects
BUN_CONFIG_USE_SYSTEM_ALLOCATOR=true

# Optimize for development speed
BUN_CONFIG_FAST_REFRESH=true

# Configure memory limits for large projects
BUN_CONFIG_MAX_OLD_SPACE_SIZE=4096
```

## 📖 Related Documentation

- [Bun Environment Variables](https://bun.sh/docs/runtime/environment-variables)
- [Bun Configuration](https://bun.sh/docs/runtime/bunfig)
- [v0dev API Documentation](https://vercel.com/docs/v0/api)
- [Environment Variables Best Practices](https://nextjs.org/docs/pages/guides/environment-variables)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
