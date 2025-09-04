# NeoVantis Notification Service - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the NeoVantis Notification Service in both development and production environments using Docker.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- PostgreSQL 14+ (if not using Docker)
- Redis 6+ (if not using Docker)

## Quick Start

### Development Environment
```bash
# Clone and setup
git clone https://github.com/NeoVantis/NotificationService.git
cd NotificationService

# Run development setup
chmod +x setup-dev.sh
./setup-dev.sh
```

### Production Environment
```bash
# Clone and setup
git clone https://github.com/NeoVantis/NotificationService.git
cd NotificationService

# Run production setup
chmod +x setup-prod.sh
./setup-prod.sh
```

## Docker Configuration

### Development Docker Compose

The development setup includes:
- PostgreSQL database with persistent volume
- Redis for queue management
- Notification service with hot reload
- Development environment variables

### Production Docker Compose

The production setup includes:
- PostgreSQL with optimized configuration
- Redis with persistence and clustering support
- Notification service with multi-stage build
- Nginx reverse proxy with SSL
- Health monitoring and log aggregation

## Environment Configuration

### Development Environment Variables

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=notifications_dev
DB_USERNAME=notifications_user
DB_PASSWORD=dev_password_123

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration (Mailcow)
MAIL_HOST=mail.neovantis.xyz
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=no-reply@neovantis.xyz
MAIL_PASS=your_mailcow_password

# Application Configuration
NODE_ENV=development
PORT=4321
LOG_LEVEL=debug

# Queue Configuration
QUEUE_REDIS_HOST=redis
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_DB=1
```

### Production Environment Variables

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=notifications_prod
DB_USERNAME=notifications_user
DB_PASSWORD=secure_production_password

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=secure_redis_password

# Email Configuration (Mailcow)
MAIL_HOST=mail.neovantis.xyz
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=no-reply@neovantis.xyz
MAIL_PASS=production_mailcow_password

# Application Configuration
NODE_ENV=production
PORT=4321
LOG_LEVEL=info

# Queue Configuration
QUEUE_REDIS_HOST=redis
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_DB=1

# Security Configuration
API_KEY=your_production_api_key
CORS_ORIGIN=https://app.neovantis.xyz,https://admin.neovantis.xyz

# Monitoring
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_newrelic_key
```

## Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │  Notification   │    │   PostgreSQL    │
│   (Port 80/443) │────│   Service       │────│   Database      │
│                 │    │  (Port 4321)    │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │
                         ┌─────────────────┐    ┌─────────────────┐
                         │      Redis      │    │     Mailcow     │
                         │  Queue/Cache    │    │  SMTP Server    │
                         │  (Port 6379)    │    │ (External Host) │
                         └─────────────────┘    └─────────────────┘
```

## Security Considerations

### Development
- Default passwords for convenience
- Debug logging enabled
- No SSL termination
- CORS enabled for all origins

### Production
- Strong, generated passwords
- Minimal logging
- SSL termination at nginx
- Restricted CORS origins
- API key authentication
- Rate limiting
- Security headers

## Backup Strategy

### Database Backups
```bash
# Manual backup
docker exec notifications_postgres pg_dump -U notifications_user notifications_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backups (add to crontab)
0 2 * * * /path/to/NotificationService/scripts/backup-db.sh
```

### Redis Backups
```bash
# Manual backup
docker exec notifications_redis redis-cli BGSAVE
docker cp notifications_redis:/data/dump.rdb redis_backup_$(date +%Y%m%d_%H%M%S).rdb
```

## Monitoring & Health Checks

### Docker Health Checks
All services include Docker health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:4321/api/v1/health/simple"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### External Monitoring

1. **Application Monitoring**
   - Health endpoint: `/api/v1/health`
   - Metrics endpoint: `/api/v1/health/stats`

2. **Log Monitoring**
   - Application logs: `logs/combined.log`
   - Error logs: `logs/error.log`
   - Docker logs: `docker logs notifications_app`

3. **Queue Monitoring**
   - Redis queue metrics via Bull Board (development)
   - Custom metrics endpoint for queue status

## Performance Tuning

### Production Optimizations

1. **Database Configuration**
   ```postgresql
   shared_buffers = 256MB
   effective_cache_size = 1GB
   work_mem = 4MB
   maintenance_work_mem = 64MB
   max_connections = 100
   ```

2. **Redis Configuration**
   ```redis
   maxmemory 512mb
   maxmemory-policy allkeys-lru
   save 900 1
   save 300 10
   save 60 10000
   ```

3. **Node.js Configuration**
   ```env
   NODE_OPTIONS="--max-old-space-size=512"
   UV_THREADPOOL_SIZE=16
   ```

## Scaling Considerations

### Horizontal Scaling
- Multiple notification service instances
- Load balancer configuration
- Shared Redis instance
- Database connection pooling

### Vertical Scaling
- Increase container memory limits
- CPU allocation optimization
- Database performance tuning

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   ```bash
   # Check SMTP connectivity
   docker exec notifications_app npm run test:email

   # Check queue processing
   docker logs notifications_app | grep "EmailProcessor"
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker exec notifications_postgres pg_isready

   # Check connection from app
   docker exec notifications_app npm run test:db
   ```

3. **Redis Connection Issues**
   ```bash
   # Check Redis status
   docker exec notifications_redis redis-cli ping

   # Check queue status
   docker exec notifications_redis redis-cli info
   ```

### Log Analysis
```bash
# Application logs
docker logs notifications_app -f

# Database logs
docker logs notifications_postgres -f

# Redis logs
docker logs notifications_redis -f

# All services
docker-compose logs -f
```

## Maintenance

### Regular Tasks

1. **Database Maintenance**
   ```bash
   # Vacuum and analyze
   docker exec notifications_postgres psql -U notifications_user -d notifications_prod -c "VACUUM ANALYZE;"
   
   # Reindex
   docker exec notifications_postgres psql -U notifications_user -d notifications_prod -c "REINDEX DATABASE notifications_prod;"
   ```

2. **Log Rotation**
   ```bash
   # Rotate application logs
   docker exec notifications_app npm run logs:rotate
   
   # Docker log cleanup
   docker system prune -f
   ```

3. **Queue Cleanup**
   ```bash
   # Clean completed jobs
   docker exec notifications_app npm run queue:clean
   ```

### Updates and Deployments

1. **Zero-Downtime Deployment**
   ```bash
   # Pull latest changes
   git pull origin main
   
   # Build new image
   docker-compose build app
   
   # Rolling update
   docker-compose up -d --no-deps app
   ```

2. **Database Migrations**
   ```bash
   # Run migrations
   docker exec notifications_app npm run migration:run
   
   # Rollback if needed
   docker exec notifications_app npm run migration:revert
   ```

## SSL/TLS Configuration

### Development
- No SSL required
- HTTP only for simplicity

### Production
```nginx
server {
    listen 443 ssl http2;
    server_name notifications.neovantis.xyz;
    
    ssl_certificate /etc/ssl/certs/neovantis.xyz.crt;
    ssl_certificate_key /etc/ssl/private/neovantis.xyz.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://app:4321;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Support and Resources

- **Documentation**: `/docs` directory
- **API Documentation**: `API_DOCUMENTATION.md`
- **Docker Hub**: `neovantis/notification-service`
- **Support**: devops@neovantis.xyz

## License

Internal NeoVantis project - All rights reserved.
