# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files for workspace resolution
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --workspaces=false

# Copy shared package source
COPY packages/shared ./packages/shared

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Copy frontend source
WORKDIR /app/packages/frontend
COPY packages/frontend ./

# Build frontend
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
