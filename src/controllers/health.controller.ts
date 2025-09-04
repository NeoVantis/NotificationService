import { Controller, Get, Logger } from '@nestjs/common';
import { HealthService } from '../services/health.service';

@Controller('api/v1')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  async getHealth() {
    try {
      const health = await this.healthService.getHealthStatus();
      return health;
    } catch (error: unknown) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      };
    }
  }

  @Get('health/simple')
  async getSimpleHealth() {
    try {
      return await this.healthService.getSimpleHealthStatus();
    } catch (error) {
      this.logger.error('Simple health check failed:', error);
      return { status: 'error' };
    }
  }

  @Get('health/stats')
  async getHealthStats() {
    try {
      const stats = await this.healthService.getDetailedStats();
      return {
        success: true,
        message: 'Health statistics retrieved successfully',
        data: stats,
      };
    } catch (error: unknown) {
      this.logger.error('Failed to get health stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve health statistics',
        error: 'Internal server error',
      };
    }
  }
}
