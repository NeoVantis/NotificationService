import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { EmailService } from './services/email.service';
import { HealthService } from './services/health.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('Starting NeoVantis Notification Service...');

    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    // Get configuration
    const configService = app.get(ConfigService);
    const port = configService.get('PORT') || 3001;

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Enable CORS
    app.enableCors({
      origin: true, // Configure this for production
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Health checks on startup
    logger.log('Performing startup health checks...');

    try {
      // Check email service
      const emailService = app.get(EmailService);
      const emailHealthy = await emailService.verifyConnection();
      if (emailHealthy) {
        logger.log('✓ Email service connection verified');
      } else {
        logger.warn('⚠ Email service connection failed - continuing startup');
      }
    } catch (error) {
      logger.warn('⚠ Email service health check failed - continuing startup');
    }

    try {
      // Check overall health
      const healthService = app.get(HealthService);
      const health = await healthService.getSimpleHealthStatus();
      if (health.status === 'ok') {
        logger.log('✓ Database connection verified');
      } else {
        logger.error('✗ Database health check failed');
        throw new Error('Database connection failed');
      }
    } catch (error) {
      logger.error('✗ Startup health check failed:', error);
      process.exit(1);
    }

    // Start the server
    await app.listen(port);

    logger.log(`🚀 NeoVantis Notification Service is running on port ${port}`);
    logger.log(
      `📧 Email service configured for: ${configService.get('MAIL_HOST')}`,
    );
    logger.log(
      `📊 Health check available at: http://localhost:${port}/api/v1/health`,
    );
    logger.log(
      `📝 API Documentation: http://localhost:${port}/api/v1/notifications`,
    );
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
