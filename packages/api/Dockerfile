# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files for workspace resolution
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/database/package*.json ./packages/database/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies (including dev dependencies for build)
RUN npm ci --workspaces=false

# Copy package sources
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY packages/api ./packages/api

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Generate Prisma client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build API
WORKDIR /app/packages/api
RUN npm run build

# Production stage
FROM node:18-alpine

# Install netcat and wget for health checks
RUN apk add --no-cache netcat-openbsd wget

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/database/package*.json ./packages/database/
COPY packages/shared/package*.json ./packages/shared/

# Install production dependencies only
RUN npm ci --omit=dev --workspaces=false

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/api/dist ./packages/api/dist

# Copy startup script
COPY packages/api/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /app/packages/api

EXPOSE 3001

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
