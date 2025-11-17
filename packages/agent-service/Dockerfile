# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files for workspace resolution
COPY package*.json ./
COPY packages/agent-service/package*.json ./packages/agent-service/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies (including dev dependencies for build)
RUN npm ci --workspaces=false

# Copy package sources
COPY packages/shared ./packages/shared
COPY packages/agent-service ./packages/agent-service

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build agent-service
WORKDIR /app/packages/agent-service
RUN npm run build

# Production stage
FROM node:18-alpine

# Install wget for health checks
RUN apk add --no-cache wget

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/agent-service/package*.json ./packages/agent-service/
COPY packages/shared/package*.json ./packages/shared/

# Install production dependencies only
RUN npm ci --omit=dev --workspaces=false

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/agent-service/dist ./packages/agent-service/dist

WORKDIR /app/packages/agent-service

EXPOSE 3002

CMD ["node", "dist/index.js"]
