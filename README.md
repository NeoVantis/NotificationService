# NeoVantis Notification Service

A robust, scalable notification service built with NestJS for handling email notifications with queue processing, template management, and comprehensive monitoring.

## 🚀 Quick Start

### Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd NotificationService

# Run the development setup script
chmod +x setup-dev.sh
./setup-dev.sh
```

### Production Environment
```bash
# Clone the repository
git clone <repository-url>
cd NotificationService

# Run the production setup script
chmod +x setup-prod.sh
./setup-prod.sh
```

## � Features

### ✅ Core Functionality
- **Email Notifications**: Send single and bulk emails with queue processing
- **Template System**: Dynamic email templates with variable substitution
- **Queue Management**: Redis-based queue with retry mechanisms
- **Health Monitoring**: Comprehensive health checks and monitoring endpoints
- **Audit Logging**: Complete audit trail for all notifications

### ✅ Built-in Templates
- **Welcome**: User onboarding emails
- **Password Reset**: Secure password reset functionality
- **Email Verification**: Email address verification
- **General Notifications**: Flexible notification system

### ✅ Production Ready
- **Docker Support**: Complete containerization with Docker Compose
- **SSL/TLS**: Full HTTPS support with Nginx reverse proxy
- **Security**: API key authentication, rate limiting, security headers
- **Monitoring**: Health checks, metrics, and log aggregation
- **Backup**: Automated database backup system

## 🏗️ Architecture

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

## 🛠️ Technology Stack

- **Framework**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Queue**: Redis with Bull
- **Email**: NodeMailer with Mailcow SMTP
- **Logging**: Winston
- **Monitoring**: Terminus health checks
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx (production)

## 📚 Documentation

### API Documentation
See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference including:
- All available endpoints
- Request/response examples
- Error handling
- Rate limiting
- SDK integration examples

### Deployment Guide
See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions including:
- Environment setup
- Docker configuration
- Security considerations
- Monitoring setup
- Troubleshooting guide

## 🚦 Service Status

### Health Endpoints
- **Simple Health**: `GET /api/v1/health/simple`
- **Detailed Health**: `GET /api/v1/health`
- **System Stats**: `GET /api/v1/health/stats`

### Development URLs
- **Service**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/v1/health

### Production URLs
- **Service**: https://notifications.neovantis.xyz
- **Health Check**: https://notifications.neovantis.xyz/api/v1/health

## 📧 Email Configuration

The service integrates with Mailcow for email delivery:

```env
MAIL_HOST=mail.neovantis.xyz
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=no-reply@neovantis.xyz
MAIL_PASS=your_mailcow_password
```

## 🗂️ Project Structure

```
NotificationService/
├── src/
│   ├── controllers/          # API controllers
│   ├── services/            # Business logic services
│   ├── entities/           # Database entities
│   ├── dto/                # Data transfer objects
│   ├── processors/         # Queue processors
│   └── templates/          # Email templates
├── docker-compose.dev.yml   # Development Docker setup
├── docker-compose.prod.yml  # Production Docker setup
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── setup-dev.sh           # Development setup script
├── setup-prod.sh          # Production setup script
├── API_DOCUMENTATION.md    # Complete API reference
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # This file
```

## 🔧 Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (or use Docker)
- Redis 6+ (or use Docker)

### Local Development
```bash
# Install dependencies
npm install

# Start local databases (if not using Docker)
# PostgreSQL and Redis should be running

# Copy environment file
cp .env.example .env

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Using Docker (Recommended)
```bash
# Use the development setup script
./setup-dev.sh

# Or manually with Docker Compose
docker-compose -f docker-compose.dev.yml up -d
```

## 📋 API Usage Examples

### Send Simple Email
```bash
curl -X POST http://localhost:3001/api/v1/notifications/send-email 
  -H "Content-Type: application/json" 
  -d '{
    "to": "user@example.com",
    "subject": "Test Email",
    "body": "Hello World!",
    "priority": "high"
  }'
```

### Send Template Email
```bash
curl -X POST http://localhost:3001/api/v1/notifications/send-template-email 
  -H "Content-Type: application/json" 
  -d '{
    "to": "user@example.com",
    "templateName": "welcome",
    "variables": {
      "name": "John Doe",
      "activationLink": "https://app.neovantis.xyz/activate/abc123"
    }
  }'
```

### Check Service Health
```bash
curl http://localhost:3001/api/v1/health
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Test email functionality
npm run test:email
```

## 📊 Monitoring & Logging

### Log Files
- **Application**: `logs/combined.log`
- **Errors**: `logs/error.log`
- **Nginx**: `logs/nginx/` (production)

### Monitoring
- Built-in health checks
- Queue monitoring via Redis
- Database connection monitoring
- Email service monitoring

### Metrics
Access system metrics via:
```bash
curl http://localhost:3001/api/v1/health/stats
```

## 🔐 Security Features

### Development
- Basic CORS configuration
- Debug logging enabled
- Default passwords for convenience

### Production
- API key authentication
- Rate limiting (1000 req/hour per IP)
- SSL/TLS termination
- Security headers
- Restricted CORS origins
- Password encryption
- Input validation

## 🚀 Deployment Options

### 1. Docker Compose (Recommended)
Use the provided setup scripts for automated deployment:
- `./setup-dev.sh` for development
- `./setup-prod.sh` for production

### 2. Manual Deployment
Follow the detailed instructions in [DEPLOYMENT.md](./DEPLOYMENT.md)

### 3. Cloud Deployment
The service can be deployed on:
- AWS (ECS, EC2, Lambda)
- Google Cloud (Cloud Run, GKE)
- Azure (Container Instances, AKS)
- DigitalOcean (App Platform, Droplets)

## 🔄 Queue Management

### Redis Queue Features
- **Retry Logic**: Automatic retry with exponential backoff
- **Priority Queues**: High, normal, low priority processing
- **Dead Letter Queue**: Failed jobs after max retries
- **Monitoring**: Queue status and job metrics

### Queue Commands
```bash
# View queue status
docker exec notifications_app npm run queue:status

# Clear failed jobs
docker exec notifications_app npm run queue:clean

# Retry failed jobs
docker exec notifications_app npm run queue:retry
```

## 📝 Environment Variables

### Required Variables
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`

### Optional Variables
- `NODE_ENV` (development/production)
- `LOG_LEVEL` (debug/info/warn/error)
- `API_KEY` (for authentication)
- `CORS_ORIGIN` (allowed origins)

## 🆘 Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check SMTP credentials
   - Verify Mailcow configuration
   - Check queue processing

2. **Database Connection**
   - Verify PostgreSQL is running
   - Check connection parameters
   - Ensure database exists

3. **Redis Connection**
   - Verify Redis is running
   - Check Redis password (if set)
   - Ensure Redis is accessible

### Debug Commands
```bash
# Check service logs
docker logs notifications_app -f

# Check database connectivity
docker exec notifications_app npm run test:db

# Check email connectivity
docker exec notifications_app npm run test:email

# Check all services status
docker-compose ps
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

Internal NeoVantis project - All rights reserved.

## 📞 Support

- **Documentation**: Complete API and deployment docs included
- **Issues**: Create GitHub issues for bugs and feature requests
- **Email**: devops@neovantis.xyz

---

**Made with ❤️ by the NeoVantis Team**

## API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Health Endpoints

#### GET /health
Get comprehensive system health status including database, email service, queue status, and system metrics.

#### GET /health/simple  
Simple health check returning `{status: "ok"}` or `{status: "error"}`.

#### GET /health/stats
Detailed statistics including notification counts, recent activity, and system metrics.

### Notification Endpoints

#### POST /notifications/send-email
Send a single email notification.

**Request Body:**
```json
{
  "recipientEmail": "user@example.com",
  "recipientName": "John Doe",
  "subject": "Test Email",
  "content": "This is a test email",
  "htmlContent": "<h1>This is a test email</h1>",
  "priority": "normal",
  "campaignId": "optional-campaign-id"
}
```

#### POST /notifications/send-bulk-email
Send bulk emails to multiple recipients (max 1000).

**Request Body:**
```json
{
  "recipientEmails": ["user1@example.com", "user2@example.com"],
  "subject": "Bulk Email Test",
  "content": "This is a bulk email",
  "htmlContent": "<h1>This is a bulk email</h1>",
  "priority": "normal"
}
```

#### POST /notifications/send-template-email
Send an email using a predefined template.

**Request Body:**
```json
{
  "recipientEmail": "user@example.com",
  "recipientName": "John Doe",
  "templateName": "welcome",
  "templateData": {
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

#### POST /notifications/send-bulk-template-email
Send bulk template emails with individual data for each recipient.

**Request Body:**
```json
{
  "templateName": "welcome",
  "recipients": [
    {
      "email": "user1@example.com",
      "name": "John Doe",
      "templateData": {
        "name": "John Doe",
        "email": "user1@example.com"
      }
    }
  ]
}
```

#### GET /notifications
Get paginated list of notifications with filtering options.

**Query Parameters:**
- `status`: Filter by status (pending, processing, sent, failed, retrying)
- `recipientEmail`: Filter by recipient email
- `campaignId`: Filter by campaign ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `startDate`: Filter from date (ISO string)
- `endDate`: Filter to date (ISO string)

#### GET /notifications/:id
Get details of a specific notification.

#### POST /notifications/:id/retry
Retry a failed notification.

#### GET /notifications/stats
Get notification statistics including counts by status.

### Template Management

#### POST /notifications/templates
Create a new email template.

**Request Body:**
```json
{
  "name": "custom-template",
  "subject": "{{title}} - Important Update",
  "textContent": "Hello {{name}}, {{message}}",
  "htmlContent": "<h1>{{title}}</h1><p>Hello {{name}},</p><p>{{message}}</p>",
  "description": "Custom template for updates",
  "requiredVariables": ["name", "title", "message"],
  "category": "updates"
}
```

#### GET /notifications/templates
Get all active email templates.

#### GET /notifications/templates/:name
Get a specific template by name.

#### PUT /notifications/templates/:id
Update an existing template.

#### DELETE /notifications/templates/:id
Delete (deactivate) a template.

## Default Templates

The service comes with pre-built templates:

### Welcome Template (`welcome`)
- **Purpose**: New user onboarding
- **Variables**: `name`, `email`
- **Usage**: Perfect for auth service user registration

### Password Reset Template (`password-reset`)
- **Purpose**: Password reset notifications
- **Variables**: `name`, `email`, `resetCode`, `expirationTime`
- **Usage**: Ideal for auth service password reset flow

### Email Verification Template (`email-verification`)
- **Purpose**: Email address verification
- **Variables**: `name`, `verificationCode`, `expirationTime`
- **Usage**: For auth service email verification

### General Notification Template (`notification`)
- **Purpose**: Flexible template for various notifications
- **Variables**: `name`, `subject`, `message`, `actionRequired`, `link`
- **Usage**: General purpose notifications

## Integration with Auth Service

### Example: Send Welcome Email
```bash
curl -X POST http://localhost:3001/api/v1/notifications/send-template-email \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "newuser@example.com",
    "recipientName": "John Doe",
    "templateName": "welcome",
    "templateData": {
      "name": "John Doe",
      "email": "newuser@example.com"
    }
  }'
```

### Example: Send Password Reset
```bash
curl -X POST http://localhost:3001/api/v1/notifications/send-template-email \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "user@example.com",
    "templateName": "password-reset",
    "templateData": {
      "name": "John Doe",
      "email": "user@example.com",
      "resetCode": "123456",
      "expirationTime": "10"
    }
  }'
```

### Example: Bulk User Notification
```bash
curl -X POST http://localhost:3001/api/v1/notifications/send-bulk-email \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmails": ["user1@example.com", "user2@example.com"],
    "subject": "System Maintenance Notice",
    "content": "We will be performing scheduled maintenance tonight.",
    "htmlContent": "<h2>System Maintenance Notice</h2><p>We will be performing scheduled maintenance tonight.</p>"
  }'
```

## Queue Processing

The service uses Redis and Bull for reliable message processing:

- **Queue Name**: `email`
- **Priority Levels**: Critical (10), High (5), Normal (0), Low (-5)
- **Retry Policy**: Exponential backoff with 3 attempts
- **Rate Limiting**: Configurable per minute/hour limits

### Queue Monitoring

Monitor queue status through health endpoints:
```bash
curl http://localhost:3001/api/v1/health
```

## Error Handling

The service provides comprehensive error handling:

- **Validation Errors**: 400 Bad Request with detailed validation messages
- **Not Found**: 404 for missing resources
- **Rate Limiting**: 429 Too Many Requests
- **Server Errors**: 500 with sanitized error messages
- **Queue Failures**: Automatic retry with exponential backoff

## Monitoring & Observability

### Health Monitoring
- Database connectivity
- Email service connectivity  
- Queue status and job counts
- Memory and CPU usage
- System uptime and version

### Audit Logging
All notification activities are logged:
- Email sent/failed events
- Bulk campaign tracking
- Template operations
- User actions and IP addresses

### Metrics Available
- Total notifications by status
- Recent activity patterns
- Queue job statistics
- System resource usage
- Email service response times

## Development

### Project Structure
```
src/
├── controllers/          # API controllers
├── dto/                 # Data transfer objects
├── entities/            # Database entities
├── processors/          # Queue processors
├── services/            # Business logic
├── templates/           # Default templates
├── app.module.ts        # Main application module
└── main.ts             # Application entry point
```

### Available Scripts
```bash
npm run start:dev        # Development with hot reload
npm run build           # Build for production
npm run start:prod      # Start production server
npm run test            # Run unit tests
npm run test:e2e        # Run end-to-end tests
npm run lint            # Lint code
npm run format          # Format code with Prettier
```

### Environment Variables
See `.env.example` for all available configuration options.

### Database
The service uses TypeORM with PostgreSQL. In development, `synchronize: true` automatically creates/updates tables. For production, use proper migrations.

## Security Considerations

- **Email Credentials**: Store Mailcow credentials securely
- **Database Access**: Use strong database passwords
- **JWT Secrets**: Use strong, unique JWT secrets
- **Rate Limiting**: Configure appropriate rate limits
- **CORS**: Configure CORS for production environments
- **Input Validation**: All inputs are validated using class-validator
- **SQL Injection**: Protected by TypeORM's query builder

## Production Deployment

### Requirements
- Node.js 18+ runtime
- PostgreSQL database
- Redis server
- Mailcow email server
- Process manager (PM2 recommended)

### Deployment Steps
1. Build the application: `npm run build`
2. Set production environment variables
3. Run database migrations if needed
4. Start with process manager: `pm2 start dist/main.js`
5. Configure reverse proxy (nginx recommended)
6. Set up monitoring and logging

### Docker Support
```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

## Troubleshooting

### Common Issues

**Email not sending:**
- Check Mailcow credentials in environment
- Verify SMTP connectivity: `telnet mail.neovantis.xyz 587`
- Check email service health: `GET /api/v1/health`

**Queue not processing:**
- Verify Redis connection
- Check queue status in health endpoint
- Look for errors in application logs

**Database connection issues:**
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists and user has permissions

**High memory usage:**
- Check for failed jobs accumulating in queue
- Monitor notification retention policies
- Consider adding job cleanup schedules

### Logs
Application logs are written to:
- Console output (development)
- `logs/error.log` (error level)
- `logs/combined.log` (all levels)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Create an issue in the repository
- Contact the NeoVantis development team
- Check the health endpoints for system status

---

**NeoVantis Notification Service** - Reliable, scalable, and feature-rich notification delivery for modern applications.