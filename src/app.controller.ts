import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('info')
  getInfo() {
    return {
      service: 'NeoVantis Notification Service',
      version: '1.0.0',
      description: 'Advanced notification service with email capabilities, message queues, and template support',
      features: [
        'Email notifications with Mailcow integration',
        'Bulk email campaigns',
        'Email templates with variables',
        'Message queue processing with Redis/Bull',
        'Comprehensive health monitoring',
        'Audit logging',
        'Retry mechanisms',
        'Rate limiting support',
      ],
      endpoints: {
        health: '/api/v1/health',
        notifications: '/api/v1/notifications',
        templates: '/api/v1/notifications/templates',
      },
    };
  }
}
