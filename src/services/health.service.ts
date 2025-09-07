import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmHealthIndicator, HealthCheckService } from '@nestjs/terminus';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Notification } from '../entities/notification.entity';
import { EmailService } from './email.service';
import * as os from 'os';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private configService: ConfigService,
    private emailService: EmailService,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async getHealthStatus(): Promise<any> {
    const status = await this.health.check([
      () => this.db.pingCheck('database'),
    ]);

    const uptime = (Date.now() - this.startTime) / 1000;
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    // Get queue health
    const queueHealth = await this.getQueueHealth();

    // Get email service health
    const emailHealth = await this.getEmailServiceHealth();

    // Get database health
    const dbHealth = await this.getDatabaseHealth();

    return {
      status: status.status,
      timestamp: new Date().toISOString(),
      version: this.configService.get('npm_package_version', '0.0.1'),
      uptime,
      memory: {
        total: Math.round(totalMemory / (1024 * 1024)), // MB
        free: Math.round(freeMemory / (1024 * 1024)), // MB
        used: Math.round(usedMemory / (1024 * 1024)), // MB
        usagePercent: Math.round((usedMemory / totalMemory) * 100),
        process: {
          heapUsed: Math.round(memoryUsage.heapUsed / (1024 * 1024)), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / (1024 * 1024)), // MB
          external: Math.round(memoryUsage.external / (1024 * 1024)), // MB
          rss: Math.round(memoryUsage.rss / (1024 * 1024)), // MB
        },
      },
      cpu: {
        cores: os.cpus().length,
        loadAverage: os.loadavg(),
        model: os.cpus()[0]?.model || 'Unknown',
        speed: os.cpus()[0]?.speed || 0,
      },
      database: dbHealth,
      queue: queueHealth,
      email: emailHealth,
      network: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
      },
    };
  }

  async getSimpleHealthStatus(): Promise<{ status: string }> {
    try {
      await this.health.check([() => this.db.pingCheck('database')]);
      return { status: 'ok' };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return { status: 'error' };
    }
  }

  private async getQueueHealth(): Promise<any> {
    try {
      const waiting = await this.emailQueue.getWaiting();
      const active = await this.emailQueue.getActive();
      const completed = await this.emailQueue.getCompleted();
      const failed = await this.emailQueue.getFailed();
      const delayed = await this.emailQueue.getDelayed();

      return {
        status: 'healthy',
        jobs: {
          waiting: waiting.length,
          active: active.length,
          completed: completed.length,
          failed: failed.length,
          delayed: delayed.length,
        },
      };
    } catch (error) {
      this.logger.error('Queue health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private async getEmailServiceHealth(): Promise<any> {
    try {
      const startTime = Date.now();
      const isConnected = await this.emailService.verifyConnection();
      const responseTime = Date.now() - startTime;

      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        responseTime,
        smtp: {
          host: this.configService.get('MAIL_HOST'),
          port: this.configService.get('MAIL_PORT'),
          secure: this.configService.get('MAIL_SECURE'),
        },
      };
    } catch (error) {
      this.logger.error('Email service health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private async getDatabaseHealth(): Promise<any> {
    try {
      const startTime = Date.now();
      await this.notificationRepository.count();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: -1,
      };
    }
  }

  async getDetailedStats(): Promise<any> {
    try {
      // Get notification statistics
      const notificationStats = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('notification.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('notification.status')
        .getRawMany();

      const stats = {
        total: 0,
        pending: 0,
        processing: 0,
        sent: 0,
        failed: 0,
        retrying: 0,
      };

      notificationStats.forEach((stat) => {
        const count = parseInt(stat.count);
        stats.total += count;
        if (stats.hasOwnProperty(stat.status.toLowerCase())) {
          stats[stat.status.toLowerCase()] = count;
        }
      });

      // Get recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentActivity = await this.notificationRepository
        .createQueryBuilder('notification')
        .select("DATE_TRUNC('hour', notification.createdAt)", 'hour')
        .addSelect('COUNT(*)', 'count')
        .where('notification.createdAt >= :yesterday', { yesterday })
        .groupBy("DATE_TRUNC('hour', notification.createdAt)")
        .orderBy('hour', 'ASC')
        .getRawMany();

      return {
        notifications: stats,
        recentActivity,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get detailed stats:', error);
      throw error;
    }
  }
}
