import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import {
  Notification,
  NotificationStatus,
  NotificationType,
  NotificationPriority,
} from '../entities/notification.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import {
  NotificationAudit,
  AuditAction,
} from '../entities/notification-audit.entity';
import { EmailService } from './email.service';
import {
  SendEmailDto,
  SendBulkEmailDto,
  SendTemplateEmailDto,
  SendBulkTemplateEmailDto,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  GetNotificationsQueryDto,
} from '../dto/notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(NotificationAudit)
    private auditRepository: Repository<NotificationAudit>,
    @InjectQueue('email') private emailQueue: Queue,
    private emailService: EmailService,
  ) {}

  async sendEmail(
    sendEmailDto: SendEmailDto,
    userId?: string,
  ): Promise<{ id: string; status: string }> {
    try {
      const notification = new Notification();
      notification.notificationType = NotificationType.EMAIL;
      notification.recipientEmail = sendEmailDto.recipientEmail;
      notification.recipientName = sendEmailDto.recipientName;
      notification.subject = sendEmailDto.subject;
      notification.content = sendEmailDto.content;
      notification.htmlContent = sendEmailDto.htmlContent;
      notification.priority =
        sendEmailDto.priority || NotificationPriority.NORMAL;
      notification.scheduledAt = sendEmailDto.scheduledAt
        ? new Date(sendEmailDto.scheduledAt)
        : new Date();
      notification.metadata = sendEmailDto.metadata;
      notification.campaignId = sendEmailDto.campaignId;
      notification.status = NotificationStatus.PENDING;

      const savedNotification =
        await this.notificationRepository.save(notification);

      // Add to queue for processing
      const jobPriority = this.getJobPriority(notification.priority);
      const delay = notification.scheduledAt.getTime() - Date.now();

      await this.emailQueue.add(
        'send-email',
        { notificationId: savedNotification.id },
        {
          priority: jobPriority,
          delay: delay > 0 ? delay : 0,
          attempts: notification.maxRetries,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      // Log audit
      await this.createAuditLog(
        AuditAction.EMAIL_SENT,
        userId,
        sendEmailDto.recipientEmail,
        savedNotification.id,
        'Email queued for sending',
      );

      this.logger.log(
        `Email queued for ${sendEmailDto.recipientEmail} with ID: ${savedNotification.id}`,
      );

      return {
        id: savedNotification.id,
        status: 'queued',
      };
    } catch (error) {
      this.logger.error('Failed to queue email:', error);
      throw error;
    }
  }

  async sendBulkEmail(
    sendBulkEmailDto: SendBulkEmailDto,
    userId?: string,
  ): Promise<{
    campaignId: string;
    totalEmails: number;
    queuedEmails: number;
  }> {
    try {
      const campaignId =
        sendBulkEmailDto.campaignId ||
        `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let queuedEmails = 0;

      // Log bulk email start
      await this.createAuditLog(
        AuditAction.BULK_EMAIL_STARTED,
        userId,
        undefined,
        undefined,
        `Bulk email started for ${sendBulkEmailDto.recipientEmails.length} recipients`,
        { campaignId },
      );

      for (const email of sendBulkEmailDto.recipientEmails) {
        try {
          const emailDto: SendEmailDto = {
            recipientEmail: email,
            subject: sendBulkEmailDto.subject,
            content: sendBulkEmailDto.content,
            htmlContent: sendBulkEmailDto.htmlContent,
            priority: sendBulkEmailDto.priority,
            scheduledAt: sendBulkEmailDto.scheduledAt,
            metadata: sendBulkEmailDto.metadata,
            campaignId,
          };

          await this.sendEmail(emailDto, userId);
          queuedEmails++;
        } catch (error) {
          this.logger.error(`Failed to queue email for ${email}:`, error);
        }
      }

      // Log bulk email completion
      await this.createAuditLog(
        AuditAction.BULK_EMAIL_COMPLETED,
        userId,
        undefined,
        undefined,
        `Bulk email completed: ${queuedEmails}/${sendBulkEmailDto.recipientEmails.length} emails queued`,
        { campaignId },
      );

      this.logger.log(
        `Bulk email campaign ${campaignId}: ${queuedEmails}/${sendBulkEmailDto.recipientEmails.length} emails queued`,
      );

      return {
        campaignId,
        totalEmails: sendBulkEmailDto.recipientEmails.length,
        queuedEmails,
      };
    } catch (error) {
      this.logger.error('Failed to send bulk email:', error);
      throw error;
    }
  }

  async sendTemplateEmail(
    sendTemplateEmailDto: SendTemplateEmailDto,
    userId?: string,
  ): Promise<{ id: string; status: string }> {
    try {
      const template = await this.emailTemplateRepository.findOne({
        where: { name: sendTemplateEmailDto.templateName, isActive: true },
      });

      if (!template) {
        throw new NotFoundException(
          `Template '${sendTemplateEmailDto.templateName}' not found or inactive`,
        );
      }

      // Merge default data with provided data
      const templateData = {
        ...template.defaultData,
        ...sendTemplateEmailDto.templateData,
      };

      // Replace template variables
      const subject = this.emailService.replaceTemplateVariables(
        template.subject,
        templateData,
      );
      const content = this.emailService.replaceTemplateVariables(
        template.textContent,
        templateData,
      );
      const htmlContent = this.emailService.replaceTemplateVariables(
        template.htmlContent,
        templateData,
      );

      const emailDto: SendEmailDto = {
        recipientEmail: sendTemplateEmailDto.recipientEmail,
        recipientName: sendTemplateEmailDto.recipientName,
        subject,
        content,
        htmlContent,
        priority: sendTemplateEmailDto.priority,
        scheduledAt: sendTemplateEmailDto.scheduledAt,
        metadata: sendTemplateEmailDto.metadata,
        campaignId: sendTemplateEmailDto.campaignId,
      };

      const result = await this.sendEmail(emailDto, userId);

      // Update notification with template information
      await this.notificationRepository.update(result.id, {
        templateName: template.name,
        templateData,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to send template email:', error);
      throw error;
    }
  }

  async sendBulkTemplateEmail(
    sendBulkTemplateEmailDto: SendBulkTemplateEmailDto,
    userId?: string,
  ): Promise<{
    campaignId: string;
    totalEmails: number;
    queuedEmails: number;
  }> {
    try {
      const template = await this.emailTemplateRepository.findOne({
        where: { name: sendBulkTemplateEmailDto.templateName, isActive: true },
      });

      if (!template) {
        throw new NotFoundException(
          `Template '${sendBulkTemplateEmailDto.templateName}' not found or inactive`,
        );
      }

      const campaignId =
        sendBulkTemplateEmailDto.campaignId ||
        `bulk_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let queuedEmails = 0;

      for (const recipient of sendBulkTemplateEmailDto.recipients) {
        try {
          const templateEmailDto: SendTemplateEmailDto = {
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            templateName: sendBulkTemplateEmailDto.templateName,
            templateData: recipient.templateData,
            priority: sendBulkTemplateEmailDto.priority,
            scheduledAt: sendBulkTemplateEmailDto.scheduledAt,
            metadata: sendBulkTemplateEmailDto.metadata,
            campaignId,
          };

          await this.sendTemplateEmail(templateEmailDto, userId);
          queuedEmails++;
        } catch (error) {
          this.logger.error(
            `Failed to queue template email for ${recipient.email}:`,
            error,
          );
        }
      }

      this.logger.log(
        `Bulk template email campaign ${campaignId}: ${queuedEmails}/${sendBulkTemplateEmailDto.recipients.length} emails queued`,
      );

      return {
        campaignId,
        totalEmails: sendBulkTemplateEmailDto.recipients.length,
        queuedEmails,
      };
    } catch (error) {
      this.logger.error('Failed to send bulk template email:', error);
      throw error;
    }
  }

  async getNotifications(query: GetNotificationsQueryDto): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = parseInt(query.page || '1') || 1;
    const limit = Math.min(parseInt(query.limit || '10') || 10, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Notification> = {};

    if (query.status) {
      where.status = query.status as NotificationStatus;
    }
    if (query.recipientEmail) {
      where.recipientEmail = query.recipientEmail;
    }
    if (query.campaignId) {
      where.campaignId = query.campaignId;
    }
    if (query.startDate && query.endDate) {
      where.createdAt = Between(
        new Date(query.startDate),
        new Date(query.endDate),
      );
    }

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getNotificationById(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async retryFailedNotification(id: string): Promise<{ status: string }> {
    const notification = await this.getNotificationById(id);

    if (notification.status !== NotificationStatus.FAILED) {
      throw new Error('Only failed notifications can be retried');
    }

    if (notification.retryCount >= notification.maxRetries) {
      throw new Error('Maximum retry attempts exceeded');
    }

    // Reset status and add back to queue
    await this.notificationRepository.update(id, {
      status: NotificationStatus.PENDING,
      errorMessage: undefined,
    });

    const jobPriority = this.getJobPriority(notification.priority);
    await this.emailQueue.add(
      'send-email',
      { notificationId: id },
      {
        priority: jobPriority,
        attempts: notification.maxRetries - notification.retryCount,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    return { status: 'queued_for_retry' };
  }

  // Template management methods
  async createEmailTemplate(
    createTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const existingTemplate = await this.emailTemplateRepository.findOne({
      where: { name: createTemplateDto.name },
    });

    if (existingTemplate) {
      throw new Error(
        `Template with name '${createTemplateDto.name}' already exists`,
      );
    }

    const template = this.emailTemplateRepository.create(createTemplateDto);
    return await this.emailTemplateRepository.save(template);
  }

  async updateEmailTemplate(
    id: string,
    updateTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    Object.assign(template, updateTemplateDto);
    return await this.emailTemplateRepository.save(template);
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await this.emailTemplateRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getEmailTemplateByName(name: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { name, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(`Template '${name}' not found`);
    }

    return template;
  }

  async deleteEmailTemplate(id: string): Promise<{ message: string }> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.emailTemplateRepository.update(id, { isActive: false });

    return { message: 'Template deleted successfully' };
  }

  // Utility methods
  private getJobPriority(priority: NotificationPriority): number {
    switch (priority) {
      case NotificationPriority.CRITICAL:
        return 10;
      case NotificationPriority.HIGH:
        return 5;
      case NotificationPriority.NORMAL:
        return 0;
      case NotificationPriority.LOW:
        return -5;
      default:
        return 0;
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

  async getNotificationStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    sent: number;
    failed: number;
    retrying: number;
  }> {
    const stats = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('notification.status')
      .getRawMany();

    const result = {
      total: 0,
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      retrying: 0,
    };

    stats.forEach((stat) => {
      const count = parseInt(stat.count);
      result.total += count;
      result[stat.status.toLowerCase()] = count;
    });

    return result;
  }
}
