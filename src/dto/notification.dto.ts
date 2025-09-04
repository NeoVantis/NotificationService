import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { NotificationPriority } from '../entities/notification.entity';

export class SendEmailDto {
  @IsEmail()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  recipientName?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subject: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  campaignId?: string;
}

export class SendBulkEmailDto {
  @IsArray()
  @IsEmail({}, { each: true })
  recipientEmails: string[];

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subject: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  campaignId?: string;
}

export class SendTemplateEmailDto {
  @IsEmail()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  recipientName?: string;

  @IsString()
  @MaxLength(100)
  templateName: string;

  @IsObject()
  templateData: Record<string, any>;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  campaignId?: string;
}

export class SendBulkTemplateEmailDto {
  @IsArray()
  recipients: Array<{
    email: string;
    name?: string;
    templateData: Record<string, any>;
  }>;

  @IsString()
  @MaxLength(100)
  templateName: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  campaignId?: string;
}

export class CreateEmailTemplateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  subject: string;

  @IsString()
  @MinLength(1)
  textContent: string;

  @IsString()
  @MinLength(1)
  htmlContent: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsObject()
  defaultData?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredVariables?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}

export class UpdateEmailTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  subject?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  textContent?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  htmlContent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsObject()
  defaultData?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredVariables?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}

export class GetNotificationsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
