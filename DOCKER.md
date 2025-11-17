# Docker Setup Guide

This guide provides detailed information about using Docker with the Aidvocacy application.

## Architecture

The Docker setup consists of the following services:

```
┌─────────────┐
│   Nginx     │ (Production only - Reverse Proxy)
│   Port 80   │
└──────┬──────┘
       │
       ├─────────────┬─────────────┬──────────────┐
       │             │             │              │
┌──────▼──────┐ ┌───▼────┐  ┌────▼─────┐  ┌─────▼─────┐
│  Frontend   │ │  API   │  │  Agent   │  │ PostgreSQL│
│  (Nginx)    │ │ :3001  │  │  :3002   │  │   :5432   │
│   Port 80   │ └───┬────┘  └────┬─────┘  └─────▲─────┘
└─────────────┘     │            │              │
                    └────────────┴──────────────┘
```

## Services

### 1. PostgreSQL Database
- **Image**: `postgres:14-alpine`
- **Port**: 5432
- **Volume**: `postgres_data` for data persistence
- **Health Check**: Automatic readiness check

### 2. API Service
- **Base**: Node.js 18 Alpine
- **Port**: 3001
- **Dependencies**: PostgreSQL
- **Features**:
  - Automatic database migration on startup
  - Optional database seeding
  - Health check endpoint

### 3. Agent Service
- **Base**: Node.js 18 Alpine
- **Port**: 3002
- **Dependencies**: API service
- **External**: Twilio, OpenAI
- **Note**: Requires PUBLIC_URL for Twilio webhooks

### 4. Frontend
- **Base**: Nginx Alpine
- **Port**: 80 (mapped to 3000 in development)
- **Features**:
  - Static file serving
  - React Router support
  - Gzip compression
  - Security headers

### 5. Nginx Reverse Proxy (Production Only)
- **Port**: 80, 443
- **Features**:
  - SSL/TLS termination
  - Rate limiting
  - Request routing
  - Static file caching

## Development Workflow

### Starting Development Environment

```bash
# First time setup
cp .env.docker.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Or view logs for specific service
docker-compose logs -f api
```

### Making Code Changes

When you make changes to the code:

```bash
# Rebuild specific service
docker-compose build api

# Restart the service
docker-compose restart api

# Or rebuild and restart in one command
docker-compose up -d --build api
```

### Database Operations

```bash
# Run migrations
docker-compose exec api sh -c "cd /app/packages/database && npx prisma migrate deploy"

# Seed database
docker-compose exec api sh -c "cd /app/packages/database && npm run seed"

# Open Prisma Studio
docker-compose exec api sh -c "cd /app/packages/database && npx prisma studio"

# Access PostgreSQL shell
docker-compose exec postgres psql -U aidvocacy -d aidvocacy

# Backup database
docker-compose exec postgres pg_dump -U aidvocacy aidvocacy > backup.sql

# Restore database
docker-compose exec -T postgres psql -U aidvocacy -d aidvocacy < backup.sql
```

### Debugging

```bash
# Open shell in container
docker-compose exec api sh

# Check service logs
docker-compose logs --tail=100 -f api

# Check all service status
docker-compose ps

# Inspect service details
docker-compose exec api env
```

## Production Deployment

### Prerequisites

1. Server with Docker and Docker Compose installed
2. Domain name pointed to your server
3. SSL certificate (Let's Encrypt recommended)

### Setup Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd aidvocacy
```

2. **Configure Environment**
```bash
cp .env.docker.example .env.prod

# Edit .env.prod with production values:
# - Strong database passwords (use password generator)
# - Production Twilio credentials
# - Production OpenAI API key
# - Your domain name for PUBLIC_URL
# - Set SEED_DATABASE=false
```

3. **Configure SSL Certificates**
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Option 1: Use Let's Encrypt (recommended)
# Install certbot and generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem

# Option 2: Use self-signed certificate (development only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem
```

4. **Update Nginx Configuration**

Edit `nginx/nginx.conf` and uncomment the HTTPS server block. Update `server_name` with your domain.

5. **Start Production Stack**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Verify all services are healthy
docker-compose -f docker-compose.prod.yml ps
```

### Production Monitoring

```bash
# View resource usage
docker stats

# Check service health
docker-compose -f docker-compose.prod.yml ps

# View recent logs
docker-compose -f docker-compose.prod.yml logs --tail=100 -f

# Restart services
docker-compose -f docker-compose.prod.yml restart api
```

### Updating Production

```bash
# Pull latest code
git pull origin main

# Rebuild services
docker-compose -f docker-compose.prod.yml --env-file .env.prod build

# Restart with zero downtime (using recreate)
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --force-recreate --no-deps api

# Or restart all services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID | `ACxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `your_auth_token` |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | `+15555551234` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-xxxxxxxxxxxxx` |
| `PUBLIC_URL` | Public URL for webhooks | `https://yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | `aidvocacy` |
| `POSTGRES_PASSWORD` | Database password | `aidvocacy_password` |
| `POSTGRES_DB` | Database name | `aidvocacy` |
| `SEED_DATABASE` | Seed test data | `false` |
| `FRONTEND_PORT` | Frontend port | `3000` |
| `API_PORT` | API port | `3001` |
| `AGENT_PORT` | Agent service port | `3002` |

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs service-name

# Check service status
docker-compose ps

# Verify environment variables
docker-compose config

# Remove and recreate containers
docker-compose down
docker-compose up -d
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify connection from API
docker-compose exec api sh -c "nc -zv postgres 5432"

# Reset database (WARNING: deletes data)
docker-compose down -v
docker-compose up -d
```

### Migration Errors

```bash
# Check current migration status
docker-compose exec api sh -c "cd /app/packages/database && npx prisma migrate status"

# Force migration
docker-compose exec api sh -c "cd /app/packages/database && npx prisma migrate deploy"

# Reset migrations (WARNING: deletes data)
docker-compose down -v
docker-compose up -d
```

### Webhook Issues

```bash
# Check agent service is running
docker-compose ps agent-service

# Check agent service logs
docker-compose logs -f agent-service

# Verify PUBLIC_URL is set
docker-compose exec agent-service env | grep PUBLIC_URL

# Test webhook accessibility
curl -I https://your-public-url/health
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Increase memory limits in docker-compose.prod.yml
# Edit deploy.resources.limits values

# Check disk space
docker system df

# Clean up unused resources
docker system prune -a
```

## Best Practices

### Development

1. **Use .env file**: Never commit `.env` files to version control
2. **Rebuild after changes**: Always rebuild after code changes
3. **Check logs**: Monitor logs when debugging issues
4. **Use volumes for data**: Never store important data in containers

### Production

1. **Use strong passwords**: Generate secure database passwords
2. **Enable SSL**: Always use HTTPS in production
3. **Monitor resources**: Set up monitoring for CPU, memory, disk
4. **Backup database**: Regular automated backups
5. **Update regularly**: Keep Docker images and dependencies updated
6. **Resource limits**: Set appropriate memory and CPU limits
7. **Health checks**: Ensure all health checks are working
8. **Log rotation**: Configure log rotation to prevent disk fill

### Security

1. **Network isolation**: Services communicate on internal network
2. **Minimal exposure**: Only expose necessary ports
3. **Security headers**: Nginx adds security headers
4. **Rate limiting**: Protect against abuse
5. **Regular updates**: Keep base images updated
6. **Secrets management**: Use Docker secrets for sensitive data
7. **Non-root user**: Consider running containers as non-root

## Performance Optimization

### Build Optimization

```bash
# Use build cache effectively
docker-compose build --parallel

# Multi-stage builds reduce image size
# Each Dockerfile uses multi-stage builds

# Clean build cache periodically
docker builder prune
```

### Runtime Optimization

```bash
# Use production mode
NODE_ENV=production

# Limit resources per service (in docker-compose.prod.yml)
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M

# Use Alpine images (smaller, faster)
# All images use Alpine variants
```

## Advanced Configuration

### Custom Networking

```bash
# Create custom network
docker network create --driver bridge custom-network

# Attach services to network
# Add to docker-compose.yml networks section
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect aidvocacy_postgres_data

# Backup volume
docker run --rm -v aidvocacy_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore volume
docker run --rm -v aidvocacy_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

### Docker Compose Profiles

Add profiles for different environments:

```yaml
# In docker-compose.yml
services:
  debug:
    profiles: ["debug"]
    # Debug-specific configuration
```

```bash
# Start with profile
docker-compose --profile debug up
```

## Useful Commands

```bash
# View all containers
docker ps -a

# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Clean everything
docker system prune -a --volumes

# Export container filesystem
docker export container-name > container.tar

# Check Docker version
docker --version
docker-compose --version
```

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Node.js Docker Hub](https://hub.docker.com/_/node)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

## Support

For issues specific to Docker setup, please check:
1. Docker logs: `docker-compose logs`
2. Service status: `docker-compose ps`
3. Environment variables: `docker-compose config`
4. GitHub Issues: Report Docker-specific issues with the `docker` label
