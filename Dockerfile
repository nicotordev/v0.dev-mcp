# Build stage
FROM oven/bun:1.2.18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and source code together
COPY package.json ./
COPY bun.lock ./
COPY tsconfig.json ./
COPY src/ ./src/

# Install dependencies and build in one step
RUN bun install --frozen-lockfile && \
    bun run build

# Production stage
FROM oven/bun:1.2.18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copy package files for production install
COPY package.json ./
COPY bun.lock ./

# Install only production dependencies (skip scripts to avoid build step)
RUN bun install --production --frozen-lockfile --ignore-scripts && \
    bun pm cache rm && \
    rm -rf /tmp/* /var/cache/apk/*

# Copy other necessary files
COPY --chown=nodejs:nodejs examples/ ./examples/

# Switch to non-root user
USER nodejs

# Expose port (if needed for HTTP transport)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "console.log('Health check passed')" || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV BUN_ENV=production

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["bun", "run", "dist/index.js"]

# Metadata
LABEL maintainer="Nicolas Torres <nicotordev@gmail.com>"
LABEL description="v0-mcp-ts: A powerful MCP server for v0.dev AI integration"
LABEL version="1.0.0"
LABEL repository="https://github.com/nicotordev/v0-mcp-ts"