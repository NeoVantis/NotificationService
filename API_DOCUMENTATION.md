# NeoVantis Notification Service API Documentation

## Overview

The NeoVantis Notification Service is a robust, scalable microservice built with NestJS for handling email notifications with queue processing, template management, and comprehensive monitoring.

## Base URL
```
Development: http://localhost:3001
Production: https://notifications.neovantis.xyz
```

## Authentication
Currently, the service operates without authentication. For production use, implement API key authentication or JWT tokens.

## API Endpoints

### 📧 Email Notifications

#### Send Single Email
```http
POST /api/v1/notifications/send-email
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Email Subject",
  "body": "Plain text email content",
  "htmlBody": "<h1>HTML Email Content</h1>",
  "priority": "high"
}
```

**Parameters:**
- `to` (string, required): Recipient email address
- `subject` (string, required): Email subject line
- `body` (string, required): Plain text email content
- `htmlBody` (string, optional): HTML formatted email content
- `priority` (string, optional): Email priority (`low`, `normal`, `high`)

**Response:**
```json
{
  "success": true,
  "message": "Email queued successfully",
  "data": {
    "id": "uuid",
    "status": "pending",
    "recipient": "user@example.com",
    "subject": "Email Subject",
    "priority": "high",
    "createdAt": "2025-09-04T17:30:00.000Z"
  }
}
```

#### Send Bulk Email
```http
POST /api/v1/notifications/send-bulk-email
```

**Request Body:**
```json
{
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Bulk Email Subject",
  "body": "Plain text content for all recipients",
  "htmlBody": "<h1>HTML content for all recipients</h1>",
  "priority": "normal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk emails queued successfully",
  "data": {
    "totalQueued": 2,
    "notifications": [
      {
        "id": "uuid1",
        "recipient": "user1@example.com",
        "status": "pending"
      },
      {
        "id": "uuid2",
        "recipient": "user2@example.com",
        "status": "pending"
      }
    ]
  }
}
```

#### Send Template Email
```http
POST /api/v1/notifications/send-template-email
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "templateName": "welcome",
  "variables": {
    "name": "John Doe",
    "activationLink": "https://app.neovantis.xyz/activate/token"
  },
  "priority": "high"
}
```

**Parameters:**
- `to` (string, required): Recipient email address
- `templateName` (string, required): Name of the email template
- `variables` (object, optional): Variables to substitute in the template
- `priority` (string, optional): Email priority

#### Send Bulk Template Email
```http
POST /api/v1/notifications/send-bulk-template-email
```

**Request Body:**
```json
{
  "recipients": [
    {
      "email": "user1@example.com",
      "variables": {
        "name": "John Doe",
        "activationLink": "https://app.neovantis.xyz/activate/token1"
      }
    },
    {
      "email": "user2@example.com",
      "variables": {
        "name": "Jane Smith",
        "activationLink": "https://app.neovantis.xyz/activate/token2"
      }
    }
  ],
  "templateName": "welcome",
  "priority": "normal"
}
```

### 📊 Notification Management

#### Get Notifications
```http
GET /api/v1/notifications?page=1&limit=10&status=sent&priority=high
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status (`pending`, `sent`, `failed`)
- `priority` (string, optional): Filter by priority (`low`, `normal`, `high`)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "recipient": "user@example.com",
        "subject": "Email Subject",
        "status": "sent",
        "priority": "high",
        "sentAt": "2025-09-04T17:35:00.000Z",
        "createdAt": "2025-09-04T17:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### Get Single Notification
```http
GET /api/v1/notifications/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "recipient": "user@example.com",
    "subject": "Email Subject",
    "body": "Email content",
    "htmlBody": "<h1>Email content</h1>",
    "status": "sent",
    "priority": "high",
    "attempts": 1,
    "lastAttemptAt": "2025-09-04T17:35:00.000Z",
    "sentAt": "2025-09-04T17:35:00.000Z",
    "createdAt": "2025-09-04T17:30:00.000Z",
    "metadata": {},
    "auditLogs": [
      {
        "status": "pending",
        "timestamp": "2025-09-04T17:30:00.000Z"
      },
      {
        "status": "sent",
        "timestamp": "2025-09-04T17:35:00.000Z"
      }
    ]
  }
}
```

#### Retry Failed Notification
```http
POST /api/v1/notifications/{id}/retry
```

**Response:**
```json
{
  "success": true,
  "message": "Notification queued for retry",
  "data": {
    "id": "uuid",
    "status": "pending",
    "attempts": 2
  }
}
```

#### Get Notification Statistics
```http
GET /api/v1/notifications/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1000,
    "pending": 50,
    "sent": 920,
    "failed": 30,
    "successRate": 92.0,
    "averageDeliveryTime": "2.5s",
    "dailyStats": {
      "today": 150,
      "yesterday": 200,
      "thisWeek": 750,
      "thisMonth": 3200
    }
  }
}
```

### 📝 Template Management

#### Create Email Template
```http
POST /api/v1/notifications/templates
```

**Request Body:**
```json
{
  "name": "welcome",
  "subject": "Welcome to {{appName}}!",
  "htmlTemplate": "<h1>Welcome {{name}}!</h1><p>Click <a href='{{activationLink}}'>here</a> to activate.</p>",
  "textTemplate": "Welcome {{name}}! Visit {{activationLink}} to activate your account.",
  "variables": ["name", "appName", "activationLink"],
  "category": "user-onboarding",
  "description": "Welcome email for new users"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "id": "uuid",
    "name": "welcome",
    "subject": "Welcome to {{appName}}!",
    "isActive": true,
    "createdAt": "2025-09-04T17:30:00.000Z"
  }
}
```

#### Get All Templates
```http
GET /api/v1/notifications/templates?category=user-onboarding&active=true
```

**Query Parameters:**
- `category` (string, optional): Filter by category
- `active` (boolean, optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "welcome",
      "subject": "Welcome to {{appName}}!",
      "category": "user-onboarding",
      "variables": ["name", "appName", "activationLink"],
      "isActive": true,
      "usageCount": 150,
      "createdAt": "2025-09-04T17:30:00.000Z"
    }
  ]
}
```

#### Get Template by Name
```http
GET /api/v1/notifications/templates/{name}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "welcome",
    "subject": "Welcome to {{appName}}!",
    "htmlTemplate": "<h1>Welcome {{name}}!</h1>",
    "textTemplate": "Welcome {{name}}!",
    "variables": ["name", "appName", "activationLink"],
    "category": "user-onboarding",
    "description": "Welcome email for new users",
    "isActive": true,
    "usageCount": 150,
    "createdAt": "2025-09-04T17:30:00.000Z",
    "updatedAt": "2025-09-04T17:30:00.000Z"
  }
}
```

#### Update Template
```http
PUT /api/v1/notifications/templates/{id}
```

**Request Body:**
```json
{
  "subject": "Updated Welcome to {{appName}}!",
  "htmlTemplate": "<h1>Updated Welcome {{name}}!</h1>",
  "isActive": true
}
```

#### Delete Template
```http
DELETE /api/v1/notifications/templates/{id}
```

### 🔍 Health Monitoring

#### Health Check
```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "email": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "email": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  }
}
```

#### Simple Health Check
```http
GET /api/v1/health/simple
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-04T17:30:00.000Z",
  "uptime": "2h 30m 45s"
}
```

#### System Statistics
```http
GET /api/v1/health/stats
```

**Response:**
```json
{
  "system": {
    "uptime": "2h 30m 45s",
    "memory": {
      "used": "128MB",
      "total": "512MB",
      "percentage": 25
    },
    "cpu": {
      "usage": "15%"
    }
  },
  "queue": {
    "waiting": 5,
    "active": 2,
    "completed": 1000,
    "failed": 10
  },
  "database": {
    "connections": 5,
    "queries": 15000
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "statusCode": 400,
  "timestamp": "2025-09-04T17:30:00.000Z",
  "path": "/api/v1/notifications/send-email"
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `404` - Not Found (resource doesn't exist)
- `422` - Unprocessable Entity (business logic errors)
- `500` - Internal Server Error
- `503` - Service Unavailable (external service issues)

## Rate Limiting

- **Development**: No rate limiting
- **Production**: 1000 requests per hour per IP

## Default Email Templates

The service comes with 4 built-in templates:

1. **welcome** - User onboarding emails
   - Variables: `name`, `activationLink`, `appName`

2. **password-reset** - Password reset emails
   - Variables: `name`, `resetLink`, `expirationTime`

3. **email-verification** - Email verification
   - Variables: `name`, `verificationLink`, `code`

4. **notification** - General notifications
   - Variables: `title`, `message`, `actionLink`, `name`

## WebSocket Events (Future)

Real-time notification status updates will be available via WebSocket:

```javascript
// Connect to WebSocket
const socket = io('ws://localhost:4321');

// Listen for notification updates
socket.on('notification:status', (data) => {
  console.log(`Notification ${data.id} status: ${data.status}`);
});
```

## SDK Integration Examples

### Node.js/JavaScript
```javascript
const axios = require('axios');

class NeoVantisNotifications {
  constructor(baseUrl = 'http://localhost:4321') {
    this.baseUrl = baseUrl;
  }

  async sendEmail(emailData) {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/notifications/send-email`,
      emailData
    );
    return response.data;
  }

  async sendTemplateEmail(templateData) {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/notifications/send-template-email`,
      templateData
    );
    return response.data;
  }
}

// Usage
const notifications = new NeoVantisNotifications();
await notifications.sendEmail({
  to: 'user@example.com',
  subject: 'Test Email',
  body: 'Hello World!',
  priority: 'high'
});
```

### cURL Examples
```bash
# Send simple email
curl -X POST http://localhost:4321/api/v1/notifications/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Test Email",
    "body": "Hello World!",
    "priority": "high"
  }'

# Send template email
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

# Check health
curl http://localhost:4321/api/v1/health
```

## Monitoring & Logging

- **Logs**: All requests and email processing are logged
- **Metrics**: Performance metrics available via `/api/v1/health/stats`
- **Queue Monitoring**: Redis queue status and job processing metrics
- **Database Monitoring**: Connection pool and query performance

## Support

For API support and questions:
- **Documentation**: This file
- **Issues**: Create GitHub issues
- **Email**: devops@neovantis.xyz
