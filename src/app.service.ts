import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'NeoVantis Notification Service is running! Visit /info for service details or /api/v1/health for health status.';
  }
}
