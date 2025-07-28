# =============================================================================
# Multi-stage Dockerfile for v0-mcp-ts
# Optimized for Bun runtime with security and performance best practices
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies (for better layer caching)
# -----------------------------------------------------------------------------
FROM oven/bun:1.2.18-alpine AS deps

# Install system dependencies for better security
RUN apk add --no-cache \
    dumb-init \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json bun.lock* ./

# Install dependencies with frozen lockfile for reproducible builds
# Skip postinstall scripts since source code isn't available yet
RUN bun install --frozen-lockfile --ignore-scripts

# -----------------------------------------------------------------------------
# Stage 2: Builder (compile TypeScript)
# -----------------------------------------------------------------------------
FROM deps AS builder

# Copy source code and configuration
COPY . .

# Build the application
RUN bun run build && \
    bun run type-check

# -----------------------------------------------------------------------------
# Stage 3: Production dependencies
# -----------------------------------------------------------------------------
FROM oven/bun:1.2.18-alpine AS prod-deps

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install only production dependencies (skip scripts for production)
RUN bun install --frozen-lockfile --production --ignore-scripts && \
    bun pm cache rm

# -----------------------------------------------------------------------------
# Stage 4: Production runtime
# -----------------------------------------------------------------------------
FROM oven/bun:1.2.18-alpine AS production

# Install runtime dependencies and security tools
RUN apk add --no-cache \
    dumb-init \
    ca-certificates \
    tzdata \
    curl \
    && rm -rf /var/cache/apk/* \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nodejs:nodejs /app/package.json ./package.json

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copy necessary runtime files
COPY --from=builder --chown=nodejs:nodejs /app/examples ./examples

# Set production environment
ENV NODE_ENV=production \
    BUN_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# Switch to non-root user for security
USER nodejs

# Expose port for MCP server (if using HTTP transport)
EXPOSE $PORT

# Health check with timeout and retries
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD bun -e "process.exit(0)" || exit 1

# Use dumb-init for proper signal handling in containers
ENTRYPOINT ["dumb-init", "--"]

# Start the MCP server
CMD ["bun", "run", "dist/index.js"]

# -----------------------------------------------------------------------------
# Stage 5: Development (for development workflow)
# -----------------------------------------------------------------------------
FROM deps AS development

# Install additional development tools
RUN apk add --no-cache git

# Copy all source files
COPY . .

# Set development environment
ENV NODE_ENV=development \
    DEBUG=true \
    LOG_LEVEL=debug

# Expose port for development
EXPOSE 3000

# Use bun's development mode with hot reload
CMD ["bun", "run", "dev"]

# -----------------------------------------------------------------------------
# Metadata and labels
# -----------------------------------------------------------------------------
LABEL maintainer="Nicolas Torres <nicotordev@gmail.com>" \
      description="v0-mcp-ts: High-performance MCP server for v0.dev AI integration" \
      version="2.0.0" \
      repository="https://github.com/nicotordev/v0-mcp-ts" \
      license="MIT" \
      org.opencontainers.image.title="v0-mcp-ts" \
      org.opencontainers.image.description="AI-powered Model Context Protocol server" \
      org.opencontainers.image.url="https://github.com/nicotordev/v0-mcp-ts" \
      org.opencontainers.image.source="https://github.com/nicotordev/v0-mcp-ts" \
      org.opencontainers.image.vendor="Nicolas Torres" \
      org.opencontainers.image.licenses="MIT"
