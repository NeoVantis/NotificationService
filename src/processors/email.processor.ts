import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus } from '../entities/notification.entity';
import { NotificationAudit, AuditAction } from '../entities/notification-audit.entity';
import { EmailService } from '../services/email.service';

interface EmailJobData {
  notificationId: string;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationAudit)
    private auditRepository: Repository<NotificationAudit>,
    private emailService: EmailService,
  ) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>): Promise<void> {
    const { notificationId } = job.data;
    
    try {
      // Update status to processing
      await this.notificationRepository.update(notificationId, {
        status: NotificationStatus.PROCESSING,
      });

      // Get notification details
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }

      // Send email
      await this.emailService.sendEmail({
        to: notification.recipientEmail,
        subject: notification.subject,
        text: notification.content,
        html: notification.htmlContent,
      });

      // Update status to sent
      await this.notificationRepository.update(notificationId, {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      });

      // Log successful send
      await this.createAuditLog(
        AuditAction.EMAIL_SENT,
        undefined,
        notification.recipientEmail,
        notificationId,
        'Email sent successfully',
      );

      this.logger.log(`Email sent successfully for notification ${notificationId}`);
    } catch (error) {
      await this.handleEmailError(notificationId, error, job.attemptsMade, job.opts.attempts || 3);
    }
  }

  private async handleEmailError(
    notificationId: string,
    error: any,
    attemptsMade: number,
    maxAttempts: number,
  ): Promise<void> {
    const errorMessage = error.message || 'Unknown error';
    const isLastAttempt = attemptsMade >= maxAttempts;

    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId },
      });

      if (!notification) {
        this.logger.error(`Notification ${notificationId} not found during error handling`);
        return;
      }

      if (isLastAttempt) {
        // Final failure
        await this.notificationRepository.update(notificationId, {
          status: NotificationStatus.FAILED,
          errorMessage,
          retryCount: attemptsMade,
        });

        await this.createAuditLog(
          AuditAction.EMAIL_FAILED,
          undefined,
          notification.recipientEmail,
          notificationId,
          `Email failed after ${attemptsMade} attempts: ${errorMessage}`,
        );

        this.logger.error(`Email failed permanently for notification ${notificationId}: ${errorMessage}`);
      } else {
        // Retry attempt
        await this.notificationRepository.update(notificationId, {
          status: NotificationStatus.RETRYING,
          errorMessage,
          retryCount: attemptsMade,
        });

        this.logger.warn(`Email failed for notification ${notificationId}, will retry. Attempt ${attemptsMade}/${maxAttempts}: ${errorMessage}`);
      }
    } catch (updateError) {
      this.logger.error(`Failed to update notification ${notificationId} after error:`, updateError);
    }
  }

  private async createAuditLog(
    action: AuditAction,
    userId?: string,
    recipientEmail?: string,
    notificationId?: string,
    details?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const audit = new NotificationAudit();
      audit.action = action;
      audit.userId = userId;
      audit.recipientEmail = recipientEmail;
      audit.notificationId = notificationId;
      audit.details = details;
      audit.metadata = metadata;

      await this.auditRepository.save(audit);
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
    }
  }
}
