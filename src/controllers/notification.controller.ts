import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import {
  SendEmailDto,
  SendBulkEmailDto,
  SendTemplateEmailDto,
  SendBulkTemplateEmailDto,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  GetNotificationsQueryDto,
} from '../dto/notification.dto';

@Controller('api/v1/notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Post('send-email')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    try {
      const result = await this.notificationService.sendEmail(sendEmailDto);
      this.logger.log(`Email queued for ${sendEmailDto.recipientEmail}`);
      return {
        success: true,
        message: 'Email queued successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to queue email',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-bulk-email')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendBulkEmail(@Body() sendBulkEmailDto: SendBulkEmailDto) {
    try {
      if (sendBulkEmailDto.recipientEmails.length > 1000) {
        throw new HttpException(
          'Maximum 1000 recipients allowed per bulk email',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.notificationService.sendBulkEmail(sendBulkEmailDto);
      this.logger.log(`Bulk email campaign started: ${result.campaignId}`);
      return {
        success: true,
        message: 'Bulk email campaign started successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send bulk email:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to start bulk email campaign',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-template-email')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendTemplateEmail(@Body() sendTemplateEmailDto: SendTemplateEmailDto) {
    try {
      const result = await this.notificationService.sendTemplateEmail(sendTemplateEmailDto);
      this.logger.log(`Template email queued for ${sendTemplateEmailDto.recipientEmail}`);
      return {
        success: true,
        message: 'Template email queued successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send template email:', error);
      const status = error.message.includes('not found') 
        ? HttpStatus.NOT_FOUND 
        : HttpStatus.INTERNAL_SERVER_ERROR;
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to queue template email',
          error: error.message,
        },
        status,
      );
    }
  }

  @Post('send-bulk-template-email')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendBulkTemplateEmail(@Body() sendBulkTemplateEmailDto: SendBulkTemplateEmailDto) {
    try {
      if (sendBulkTemplateEmailDto.recipients.length > 1000) {
        throw new HttpException(
          'Maximum 1000 recipients allowed per bulk template email',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.notificationService.sendBulkTemplateEmail(sendBulkTemplateEmailDto);
      this.logger.log(`Bulk template email campaign started: ${result.campaignId}`);
      return {
        success: true,
        message: 'Bulk template email campaign started successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send bulk template email:', error);
      const status = error.message.includes('not found') 
        ? HttpStatus.NOT_FOUND 
        : HttpStatus.INTERNAL_SERVER_ERROR;
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to start bulk template email campaign',
          error: error.message,
        },
        status,
      );
    }
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getNotifications(@Query() query: GetNotificationsQueryDto) {
    try {
      const result = await this.notificationService.getNotifications(query);
      return {
        success: true,
        message: 'Notifications retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to get notifications:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve notifications',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  async getNotificationStats() {
    try {
      const stats = await this.notificationService.getNotificationStats();
      return {
        success: true,
        message: 'Notification statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      this.logger.error('Failed to get notification stats:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve notification statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getNotificationById(@Param('id') id: string) {
    try {
      const notification = await this.notificationService.getNotificationById(id);
      return {
        success: true,
        message: 'Notification retrieved successfully',
        data: { notification },
      };
    } catch (error) {
      this.logger.error(`Failed to get notification ${id}:`, error);
      const status = error.message.includes('not found') 
        ? HttpStatus.NOT_FOUND 
        : HttpStatus.INTERNAL_SERVER_ERROR;
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve notification',
          error: error.message,
        },
        status,
      );
    }
  }

  @Post(':id/retry')
  async retryNotification(@Param('id') id: string) {
    try {
      const result = await this.notificationService.retryFailedNotification(id);
      this.logger.log(`Notification ${id} queued for retry`);
      return {
        success: true,
        message: 'Notification queued for retry',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to retry notification ${id}:`, error);
      const status = error.message.includes('not found') 
        ? HttpStatus.NOT_FOUND 
        : HttpStatus.BAD_REQUEST;
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retry notification',
          error: error.message,
        },
        status,
      );
    }
  }

  // Template management endpoints
  @Post('templates')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createEmailTemplate(@Body() createTemplateDto: CreateEmailTemplateDto) {
    try {
      const template = await this.notificationService.createEmailTemplate(createTemplateDto);
      this.logger.log(`Email template created: ${template.name}`);
      return {
        success: true,
        message: 'Email template created successfully',
        data: { template },
      };
    } catch (error) {
      this.logger.error('Failed to create email template:', error);
      const status = error.message.includes('already exists') 
        ? HttpStatus.CONFLICT 
        : HttpStatus.INTERNAL_SERVER_ERROR;
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create email template',
          error: error.message,
        },
        status,
      );
    }
  }

  @Get('templates')
  async getEmailTemplates() {
    try {
      const templates = await this.notificationService.getEmailTemplates();
      return {
        success: true,
        message: 'Email templates retrieved successfully',
        data: { templates },
      };
    } catch (error) {
      this.logger.error('Failed to get email templates:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve email templates',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('templates/:name')
  async getEmailTemplateByName(@Param('name') name: string) {
    try {
      const template = await this.notificationService.getEmailTemplateByName(name);
      return {
        success: true,
        message: 'Email template retrieved successfully',
        data: { template },
      };
    } catch (error) {
      this.logger.error(`Failed to get email template ${name}:`, error);
      const status = error.message.includes('not found') 
        ? HttpStatus.NOT_FOUND 
        : HttpStatus.INTERNAL_SERVER_ERROR;
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve email template',
          error: error.message,
        },
        status,
      );
    }
  }

  @Put('templates/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateEmailTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateEmailTemplateDto,
  ) {
    try {
      const template = await this.notificationService.updateEmailTemplate(id, updateTemplateDto);
      this.logger.log(`Email template updated: ${template.name}`);
      return {
        success: true,
        message: 'Email template updated successfully',
        data: { template },
      };
    } catch (error) {
      this.logger.error(`Failed to update email template ${id}:`, error);
      const status = error.message.includes('not found') 
        ? HttpStatus.NOT_FOUND 
        : HttpStatus.INTERNAL_SERVER_ERROR;
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update email template',
          error: error.message,
        },
        status,
      );
    }
  }

  @Delete('templates/:id')
  async deleteEmailTemplate(@Param('id') id: string) {
    try {
      const result = await this.notificationService.deleteEmailTemplate(id);
      this.logger.log(`Email template deleted: ${id}`);
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      this.logger.error(`Failed to delete email template ${id}:`, error);
      const status = error.message.includes('not found') 
        ? HttpStatus.NOT_FOUND 
        : HttpStatus.INTERNAL_SERVER_ERROR;
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete email template',
          error: error.message,
        },
        status,
      );
    }
  }
}
