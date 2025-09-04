import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { TerminusModule } from '@nestjs/terminus';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

// Entities
import { Notification } from './entities/notification.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { NotificationAudit } from './entities/notification-audit.entity';

// Services
import { EmailService } from './services/email.service';
import { NotificationService } from './services/notification.service';
import { HealthService } from './services/health.service';
import { SeederService } from './services/seeder.service';

// Controllers
import { AppController } from './app.controller';
import { NotificationController } from './controllers/notification.controller';
import { HealthController } from './controllers/health.controller';

// Processors
import { EmailProcessor } from './processors/email.processor';

// App Service
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Logging
    WinstonModule.forRoot({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Notification, EmailTemplate, NotificationAudit],
        synchronize: true, // Set to false in production
        logging: false,
        ssl: false,
      }),
      inject: [ConfigService],
    }),

    // Redis/Bull Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host:
            configService.get('QUEUE_REDIS_HOST') ||
            configService.get('REDIS_HOST'),
          port:
            configService.get('QUEUE_REDIS_PORT') ||
            configService.get('REDIS_PORT'),
          password:
            configService.get('QUEUE_REDIS_PASSWORD') ||
            configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      }),
      inject: [ConfigService],
    }),

    BullModule.registerQueue({
      name: 'email',
    }),

    // TypeORM repositories
    TypeOrmModule.forFeature([Notification, EmailTemplate, NotificationAudit]),

    // Health checks
    TerminusModule,
  ],
  controllers: [AppController, NotificationController, HealthController],
  providers: [
    AppService,
    EmailService,
    NotificationService,
    HealthService,
    SeederService,
    EmailProcessor,
  ],
})
export class AppModule {}
