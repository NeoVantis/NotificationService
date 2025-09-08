# NeoVantis Notification Service – Accurate API Reference

Updated to reflect the current implemented controllers, DTOs and responses in the codebase.

## Base URLs
Development: http://localhost:4321
Production: https://notifications.neovantis.xyz

## Authentication
None at present (all endpoints are open). For production add API key/JWT + rate limiting.

## Conventions
Response (success): { success: true, message: string, data?: any }
Response (error): { success: false, message: string, error: string }
Some health endpoints return raw objects (no success wrapper) as implemented.
Timestamps are ISO 8601.

## 1. Email Notification Endpoints

### 1.1 Send Email
POST /api/v1/notifications/send-email

Request Body (SendEmailDto):
{
  "recipientEmail": "user@example.com",
  "recipientName": "Optional Name",
  "subject": "Welcome",
  "content": "Plain text body",
  "htmlContent": "<p>HTML body</p>",
  "priority": "low|normal|high|critical",
  "scheduledAt": "2025-09-08T10:15:00.000Z",
  "metadata": { "source": "signup" },
  "campaignId": "spring_launch"
}

Response:
{
  "success": true,
  "message": "Email queued successfully",
  "data": { "id": "uuid", "status": "queued" }
}

### 1.2 Send Bulk Email
POST /api/v1/notifications/send-bulk-email

Request Body (SendBulkEmailDto):
{
  "recipientEmails": ["a@x.com", "b@x.com"],
  "subject": "Announcement",
  "content": "Text body",
  "htmlContent": "<p>HTML body</p>",
  "priority": "normal",
  "scheduledAt": "2025-09-08T10:30:00.000Z",
  "metadata": { "batch": 1 },
  "campaignId": "announce_001"
}

Limits: max 1000 recipients per request (enforced).

Response:
{
  "success": true,
  "message": "Bulk email campaign started successfully",
  "data": {
    "campaignId": "bulk_...",
    "totalEmails": 2,
    "queuedEmails": 2
  }
}

### 1.3 Send Template Email
POST /api/v1/notifications/send-template-email

Request Body (SendTemplateEmailDto):
{
  "recipientEmail": "user@example.com",
  "recipientName": "Jane",
  "templateName": "welcome",
  "templateData": { "name": "Jane", "activationLink": "https://..." },
  "priority": "high",
  "scheduledAt": "2025-09-08T11:00:00.000Z",
  "metadata": { "segment": "beta" },
  "campaignId": "welcome_q3"
}

Response:
{
  "success": true,
  "message": "Template email queued successfully",
  "data": { "id": "uuid", "status": "queued" }
}

### 1.4 Send Bulk Template Email
POST /api/v1/notifications/send-bulk-template-email

Request Body (SendBulkTemplateEmailDto):
{
  "recipients": [
    { "email": "a@x.com", "name": "Alice", "templateData": { "name": "Alice" } },
    { "email": "b@x.com", "templateData": { "name": "Bob" } }
  ],
  "templateName": "welcome",
  "priority": "normal",
  "scheduledAt": "2025-09-08T12:00:00.000Z",
  "metadata": { "list": "import_42" },
  "campaignId": "welcome_bulk_q3"
}

Response:
{
  "success": true,
  "message": "Bulk template email campaign started successfully",
  "data": {
    "campaignId": "bulk_template_...",
    "totalEmails": 2,
    "queuedEmails": 2
  }
}

## 2. Notification Retrieval & Management

### 2.1 List Notifications
GET /api/v1/notifications?status=pending&recipientEmail=user@example.com&page=1&limit=10&startDate=2025-09-01T00:00:00.000Z&endDate=2025-09-08T00:00:00.000Z

Supported Query Params:
- status: pending|processing|sent|failed|retrying
- recipientEmail
- campaignId
- page (default 1)
- limit (default 10, max 100)
- startDate + endDate (ISO) – filter createdAt range (both required together)

Response:
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [ { "id": "uuid", "recipientEmail": "user@example.com", "status": "sent", "subject": "Welcome", "priority": "normal", "createdAt": "...", "sentAt": "..." } ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}

### 2.2 Get Notification By ID
GET /api/v1/notifications/{id}

Response:
{
  "success": true,
  "message": "Notification retrieved successfully",
  "data": { "notification": { "id": "uuid", "recipientEmail": "...", "status": "pending", "priority": "normal", "retryCount": 0, "maxRetries": 3, "scheduledAt": "...", "createdAt": "...", "updatedAt": "..." } }
}

### 2.3 Retry Failed Notification
POST /api/v1/notifications/{id}/retry

Only allowed if status = failed and retryCount < maxRetries.

Response (success):
{
  "success": true,
  "message": "Notification queued for retry",
  "data": { "status": "queued_for_retry" }
}

### 2.4 Notification Statistics
GET /api/v1/notifications/stats

Response:
{
  "success": true,
  "message": "Notification statistics retrieved successfully",
  "data": { "total": 10, "pending": 2, "processing": 0, "sent": 7, "failed": 1, "retrying": 0 }
}

## 3. Email Templates

### 3.1 Create Template
POST /api/v1/notifications/templates

Request Body (CreateEmailTemplateDto):
{
  "name": "welcome",
  "subject": "Welcome to {{appName}}",
  "textContent": "Hi {{name}}",
  "htmlContent": "<p>Hi {{name}}</p>
",
  "description": "Welcome email",
  "defaultData": { "appName": "NeoVantis" },
  "requiredVariables": ["name", "appName"],
  "category": "onboarding"
}

Response:
{
  "success": true,
  "message": "Email template created successfully",
  "data": { "template": { "id": "uuid", "name": "welcome", "subject": "Welcome to {{appName}}", "isActive": true, "createdAt": "..." } }
}

### 3.2 List Templates
GET /api/v1/notifications/templates

Response:
{
  "success": true,
  "message": "Email templates retrieved successfully",
  "data": { "templates": [ { "id": "uuid", "name": "welcome", "subject": "Welcome to {{appName}}", "isActive": true } ] }
}

### 3.3 Get Template By Name
GET /api/v1/notifications/templates/{name}

Response:
{
  "success": true,
  "message": "Email template retrieved successfully",
  "data": { "template": { "id": "uuid", "name": "welcome", "subject": "Welcome to {{appName}}", "textContent": "...", "htmlContent": "...", "isActive": true, "createdAt": "...", "updatedAt": "..." } }
}

### 3.4 Update Template
PUT /api/v1/notifications/templates/{id}

Request Body (partial UpdateEmailTemplateDto, supply only fields to change):
{
  "subject": "Updated subject",
  "textContent": "Updated text",
  "htmlContent": "<p>Updated</p>",
  "description": "Updated description",
  "defaultData": { "appName": "New" },
  "requiredVariables": ["name", "appName"],
  "category": "onboarding"
}

Response:
{
  "success": true,
  "message": "Email template updated successfully",
  "data": { "template": { "id": "uuid", "name": "welcome", "updatedAt": "..." } }
}

### 3.5 Delete Template (Soft Deactivate)
DELETE /api/v1/notifications/templates/{id}

Response:
{
  "success": true,
  "message": "Template deleted successfully"
}

## 4. Health & Operational Endpoints

### 4.1 Full Health
GET /api/v1/health

Raw Response Example:
{
  "status": "ok",
  "timestamp": "2025-09-08T09:30:00.000Z",
  "version": "0.0.1",
  "uptime": 123.45,
  "memory": { "total": 512, "free": 400, "used": 112, "usagePercent": 22, "process": { "heapUsed": 30, "heapTotal": 60, "external": 5, "rss": 90 } },
  "cpu": { "cores": 8, "loadAverage": [0.2,0.3,0.4], "model": "Apple M2", "speed": 2400 },
  "database": { "status": "healthy", "responseTime": 4 },
  "queue": { "status": "healthy", "jobs": { "waiting":0, "active":0, "completed":10, "failed":0, "delayed":0 } },
  "email": { "status": "healthy", "responseTime": 120, "smtp": { "host": "smtp", "port": 587, "secure": false } },
  "network": { "hostname": "...", "platform": "darwin", "arch": "arm64" }
}

### 4.2 Simple Health
GET /api/v1/health/simple
Response: { "status": "ok" | "error" }

### 4.3 Health Stats (Detailed Notification Stats)
GET /api/v1/health/stats

Response:
{
  "success": true,
  "message": "Health statistics retrieved successfully",
  "data": {
    "notifications": { "total": 10, "pending": 2, "processing": 0, "sent": 7, "failed": 1, "retrying": 0 },
    "recentActivity": [ { "hour": "2025-09-08T09:00:00.000Z", "count": "5" } ],
    "timestamp": "2025-09-08T09:30:00.000Z"
  }
}

## 5. Error Handling

Validation / business errors (example):
{
  "success": false,
  "message": "Failed to queue email",
  "error": "Template 'welcome' not found or inactive"
}

Possible HTTP Status Codes:
400 Validation / bad input
404 Resource not found (e.g., template or notification)
409 Conflict (template already exists)
500 Internal server error

## 6. Field Reference (DTO Summary)

Notification Priority: low | normal | high | critical (maps to queue priorities)

SendEmailDto: recipientEmail, recipientName?, subject, content, htmlContent?, priority?, scheduledAt?, metadata?, campaignId?
SendBulkEmailDto: recipientEmails[], subject, content, htmlContent?, priority?, scheduledAt?, metadata?, campaignId?
SendTemplateEmailDto: recipientEmail, recipientName?, templateName, templateData (object), priority?, scheduledAt?, metadata?, campaignId?
SendBulkTemplateEmailDto: recipients[{ email, name?, templateData }], templateName, priority?, scheduledAt?, metadata?, campaignId?
CreateEmailTemplateDto: name, subject, textContent, htmlContent, description?, defaultData?, requiredVariables?, category?
UpdateEmailTemplateDto: subject?, textContent?, htmlContent?, description?, defaultData?, requiredVariables?, category?

## 7. cURL Examples (Updated)

Send Email:
curl -X POST http://localhost:4321/api/v1/notifications/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "user@example.com",
    "subject": "Test",
    "content": "Hello",
    "priority": "high"
  }'

Send Template Email:
curl -X POST http://localhost:4321/api/v1/notifications/send-template-email \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "user@example.com",
    "templateName": "welcome",
    "templateData": { "name": "User", "activationLink": "https://app.example/activate" }
  }'

List Notifications:
curl "http://localhost:4321/api/v1/notifications?page=1&limit=5&status=sent"

Health:
curl http://localhost:4321/api/v1/health/simple

## 8. Planned / Not Yet Implemented
- Priority filtering on list endpoint (not currently supported by service)
- Authentication & API keys
- WebSocket real-time status events
- Hard delete for templates (currently soft via isActive=false)

## 9. Change Log
2025-09-08: Rewrote documentation to align with code (DTO names, fields, responses, removed unsupported filters, corrected health outputs).

## 10. Support
Issues: GitHub repository issue tracker
Email: devops@neovantis.xyz

