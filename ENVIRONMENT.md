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
```

### 2. Testing (.env.test)

```bash
# Mock API key for tests
V0_API_KEY=test-mock-key-12345

# Test environment
NODE_ENV=test

# Enable debug for tests
DEBUG=true
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
```

## 🚀 GitHub Actions Secrets

Configure these in your GitHub repository settings:

### Required for CI/CD:

- `NPM_TOKEN` - For publishing to npm registry
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password
- `V0_API_KEY` - Production v0dev API key

### Optional:

- `CODECOV_TOKEN` - For code coverage reports

## 📋 Setup Instructions

### 1. Get v0dev API Key

1. Visit [v0.dev](https://v0.dev)
2. Subscribe to Premium or Team plan
3. Generate API key from dashboard
4. Copy the key (format: `v1:...`)

### 2. Local Setup

```bash
# Copy example file
cp .env.example .env

# Edit with your real API key
echo "V0_API_KEY=your_real_key_here" > .env
echo "NODE_ENV=development" >> .env
echo "DEBUG=false" >> .env
```

### 3. GitHub Secrets Setup

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Add new repository secrets:

   - **NPM_TOKEN**: Your npm publish token
   - **DOCKER_USERNAME**: Your Docker Hub username
   - **DOCKER_PASSWORD**: Your Docker Hub password
   - **V0_API_KEY**: Your production v0dev API key

### 4. Verify Security

Run the security check to ensure no secrets are leaked:

```bash
npm run security-check
```

## 🔒 Security Best Practices

### ✅ DO:

- Use `.env` files for local development
- Set production vars via hosting platform
- Use mock keys for testing (`test-mock-key-12345`)
- Run security checks before deployment
- Keep API keys in GitHub Secrets for CI/CD

### ❌ DON'T:

- Commit `.env` files to git
- Use production keys in development
- Hardcode API keys in source code
- Share API keys in public channels
- Use real keys in test environments

## 🧪 Testing Environment Variables

For testing, the project automatically uses mock values:

```bash
# Automatically set in CI
V0_API_KEY=test-mock-key-12345
NODE_ENV=test
```

This ensures tests don't consume your real API quota and don't require actual credentials.

## 🔧 Environment Variable Loading Order

Based on [Next.js environment variables guide](https://nextjs.org/docs/pages/guides/environment-variables), variables are loaded in this order:

1. `process.env`
2. `.env.$(NODE_ENV).local`
3. `.env.local` (ignored in test)
4. `.env.$(NODE_ENV)`
5. `.env`

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

## 📖 Related Documentation

- [v0dev API Documentation](https://vercel.com/docs/v0/api)
- [Environment Variables Best Practices](https://nextjs.org/docs/pages/guides/environment-variables)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
