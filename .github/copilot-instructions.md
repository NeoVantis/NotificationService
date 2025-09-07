# NeoVantis Notification Service

NeoVantis Notification Service is a robust, production-ready NestJS microservice for handling email notifications with queue processing, template management, PostgreSQL database, Redis queues, and comprehensive monitoring. Built with TypeScript, Docker, and Mailcow integration.

**ALWAYS follow these instructions first and fallback to additional search and context gathering only when the information here is incomplete or found to be in error.**

## Working Effectively

### Bootstrap, Build, and Test the Repository

**CRITICAL: NEVER CANCEL long-running commands. Set timeouts to 60+ minutes for builds and 30+ minutes for tests.**

#### Prerequisites and Setup
- Ensure Node.js 18+ is installed
- Ensure Docker and Docker Compose are available
- Run bootstrap commands in this exact order:

```bash
# 1. Install dependencies (takes ~30 seconds)
npm install

# 2. Build the application (takes ~4 seconds - very fast!)
npm run build
```

#### Code Quality and Linting
```bash
# Format code (takes <1 second)
npm run format

# Lint code - IMPORTANT: This currently fails with 94 linting errors
# This is a known issue with existing code. Focus on ensuring new code follows linting rules.
npm run lint
```

**KNOWN ISSUE**: `npm run lint` fails with TypeScript linting errors in existing code. When making changes, ensure your NEW code passes linting rules, but don't attempt to fix existing linting errors unless specifically asked.

#### Testing
```bash
# Unit tests - IMPORTANT: Currently fails with 1 test expecting different return value
# This is expected behavior. Focus on testing your new functionality.
npm run test

# E2E tests - Requires full infrastructure (database, Redis)
# Will fail without Docker environment running
npm run test:e2e

# Test coverage
npm run test:cov
```

**KNOWN ISSUE**: Tests require database connectivity and will fail without the full Docker environment running.

### Docker Development Environment

**CRITICAL: This is the RECOMMENDED way to work with this codebase.**

#### Quick Start with Docker
```bash
# Use the provided setup script (handles everything automatically)
chmod +x setup-dev.sh
./setup-dev.sh
```

**NEVER CANCEL**: The setup script may take 10-15 minutes on first run including Docker image downloads and database initialization.

#### Manual Docker Setup (if setup script doesn't work)
```bash
# 1. Create environment file
cp .env.example .env

# 2. Update MAIL_PASS in .env with actual Mailcow password
# Edit .env and set MAIL_PASS=your_actual_mailcow_password

# 3. Create necessary directories
mkdir -p logs scripts config

# 4. Start development environment (NEVER CANCEL - takes 5-10 minutes)
docker compose -f docker-compose.dev.yml up -d --build
```

**Set timeout to 60+ minutes for Docker builds. NEVER CANCEL during image building or service startup.**

#### Verify Docker Environment
```bash
# Check all services are running
docker compose -f docker-compose.dev.yml ps

# Check application health (wait up to 2 minutes for startup)
curl http://localhost:4321/api/v1/health/simple

# Check logs if issues occur
docker compose -f docker-compose.dev.yml logs -f app
```

### Development Workflow

#### Running the Application
```bash
# Development mode with hot reload (requires Docker environment)
npm run start:dev

# Debug mode
npm run start:debug

# Production mode (after npm run build)
npm run start:prod
```

**IMPORTANT**: The application runs on **port 4321**, not 3001. Always use `http://localhost:4321`.

#### Service URLs (Development)
- **Main Service**: http://localhost:4321
- **API Health Check**: http://localhost:4321/api/v1/health
- **Simple Health Check**: http://localhost:4321/api/v1/health/simple
- **Redis Commander**: http://localhost:8081 (for queue monitoring)

## Validation Scenarios

**CRITICAL: Always run through complete end-to-end scenarios after making changes.**

### Complete Email Notification Workflow
```bash
# 1. Ensure Docker environment is running
docker compose -f docker-compose.dev.yml ps

# 2. Test simple health check
curl http://localhost:4321/api/v1/health/simple

# 3. Test detailed health including email service
curl http://localhost:4321/api/v1/health

# 4. Send a test email
curl -X POST http://localhost:4321/api/v1/notifications/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "Hello from Notification Service!",
    "priority": "high"
  }'

# 5. Send template email (using built-in welcome template)
curl -X POST http://localhost:4321/api/v1/notifications/send-template-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "templateName": "welcome",
    "variables": {
      "name": "John Doe",
      "activationLink": "https://app.neovantis.xyz/activate/abc123"
    }
  }'

# 6. Check notification status
curl http://localhost:4321/api/v1/notifications

# 7. View queue statistics  
curl http://localhost:4321/api/v1/health/stats
```

### Database and Queue Validation
```bash
# Check database connectivity
docker exec notifications_postgres_dev pg_isready -U notifications_user -d notifications_dev

# Check Redis connectivity
docker exec notifications_redis_dev redis-cli ping

# Monitor email queue via Redis Commander
# Open http://localhost:8081 in browser

# Check application logs for queue processing
docker logs notifications_app_dev -f
```

### Email Configuration Testing
```bash
# Test email configuration (will show connection status)
node test-email.js
```

**NOTE**: Email testing requires valid Mailcow credentials and may fail in restricted network environments.

## Common Tasks and Locations

### Key Project Structure
```
src/
├── controllers/          # API controllers (notification.controller.ts, health.controller.ts)
├── services/            # Business logic (email.service.ts, notification.service.ts)
├── entities/           # Database entities (notification.entity.ts, email-template.entity.ts)
├── dto/                # Data transfer objects (notification.dto.ts)
├── processors/         # Queue processors (email.processor.ts)
├── templates/          # Email templates (default-templates.ts)
├── app.module.ts       # Main application module
└── main.ts            # Application entry point
```

### Important Files to Know
- **Main Configuration**: `src/app.module.ts` - Database, Redis, and module configuration
- **Email Service**: `src/services/email.service.ts` - Email sending logic
- **Queue Processing**: `src/processors/email.processor.ts` - Background email processing
- **API Routes**: `src/controllers/notification.controller.ts` - REST API endpoints
- **Health Monitoring**: `src/controllers/health.controller.ts` - Health check endpoints
- **Docker Config**: `docker-compose.dev.yml` and `docker-compose.prod.yml`
- **Environment**: `.env.example` (copy to `.env` and configure)

### Built-in Email Templates
The service includes 4 built-in templates located in `src/templates/default-templates.ts`:
1. **welcome** - User onboarding emails
2. **password-reset** - Password reset functionality  
3. **email-verification** - Email address verification
4. **notification** - General purpose notifications

### Environment Configuration
**CRITICAL**: Always update these environment variables in `.env`:
```bash
# Application (runs on port 4321, not 3001)
PORT=4321
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=notifications_dev
DB_USERNAME=notifications_user
DB_PASSWORD=dev_password_123

# Email (Mailcow integration)
MAIL_HOST=mail.neovantis.xyz
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=no-reply@neovantis.xyz
MAIL_PASS=your_mailcow_password_here  # UPDATE THIS!

# Redis/Queue
REDIS_HOST=redis
REDIS_PORT=6379
```

### Pre-commit Validation
**ALWAYS run these commands before committing changes:**
```bash
# 1. Format code
npm run format

# 2. Build to check for compilation errors
npm run build

# 3. Run health check to ensure service still works
curl http://localhost:4321/api/v1/health/simple

# 4. Test your specific changes with appropriate API calls
```

**DO NOT** run `npm run lint` as a blocker since it currently fails on existing code.

## Timing Expectations and Timeouts

**CRITICAL: Set appropriate timeouts and NEVER CANCEL these operations:**

- **npm install**: ~30 seconds
- **npm run build**: ~4 seconds (very fast!)
- **npm run format**: <1 second  
- **npm run lint**: ~6 seconds (but currently fails)
- **npm run test**: ~1 second (but requires database)
- **Docker build**: 5-15 minutes (NEVER CANCEL - set 60+ minute timeout)
- **Docker compose up**: 2-5 minutes for first startup
- **Application startup**: 30-60 seconds
- **Health check response**: <5 seconds when healthy

## Troubleshooting Common Issues

### Application Won't Start
1. **Check Docker services**: `docker compose -f docker-compose.dev.yml ps`
2. **Check logs**: `docker compose -f docker-compose.dev.yml logs app`
3. **Verify database**: `docker exec notifications_postgres_dev pg_isready`
4. **Verify Redis**: `docker exec notifications_redis_dev redis-cli ping`

### Email Not Sending
1. **Check email configuration in .env** (especially MAIL_PASS)
2. **Test email connectivity**: `node test-email.js`
3. **Check email service health**: `curl http://localhost:4321/api/v1/health`
4. **Monitor queue**: Open http://localhost:8081 (Redis Commander)

### Docker Issues
1. **Network restrictions**: Docker builds may fail in restricted environments
2. **Port conflicts**: Ensure ports 4321, 5432, 6379, 8081 are available
3. **Disk space**: Docker images require significant disk space
4. **Memory**: Ensure sufficient memory for PostgreSQL and Redis

### Build/Test Failures
1. **Expected lint failures**: Focus on your new code, not existing lint errors
2. **Expected test failures**: Tests require full infrastructure
3. **Database connection errors**: Ensure Docker environment is running
4. **TypeScript errors**: Run `npm run build` to see compilation issues

## Integration Points

### With NeoVantis Auth Service
```bash
# Send welcome email after user registration
curl -X POST http://localhost:4321/api/v1/notifications/send-template-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "newuser@example.com",
    "templateName": "welcome",
    "variables": {"name": "John Doe", "email": "newuser@example.com"}
  }'

# Send password reset email
curl -X POST http://localhost:4321/api/v1/notifications/send-template-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com", 
    "templateName": "password-reset",
    "variables": {"name": "John", "resetCode": "123456", "expirationTime": "10"}
  }'
```

### Queue Management
```bash
# Check queue status
curl http://localhost:4321/api/v1/health/stats

# Monitor via Redis Commander
open http://localhost:8081

# View queue logs
docker logs notifications_app_dev | grep EmailProcessor
```

## References

- **Complete API Documentation**: `API_DOCUMENTATION.md`
- **Deployment Guide**: `DEPLOYMENT.md`  
- **Setup Scripts**: `setup-dev.sh`, `setup-prod.sh`
- **Docker Configuration**: `docker-compose.dev.yml`, `docker-compose.prod.yml`
- **Email Testing**: `test-email.js`

**Remember**: This is a production-ready service. Always test your changes thoroughly using the validation scenarios above before committing.