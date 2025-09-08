import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const emailConfig: EmailConfig = {
      host: this.configService.get<string>('MAIL_HOST') || 'localhost',
      port: this.configService.get<number>('MAIL_PORT') || 587,
      secure: this.configService.get<boolean>('MAIL_SECURE', false),
      auth: {
        user: this.configService.get<string>('MAIL_USER') || '',
        pass: this.configService.get<string>('MAIL_PASSWORD') || '',
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
    this.logger.log('Email service initialized with Mailcow configuration');
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const fromName = this.configService.get<string>('MAIL_FROM_NAME');
      const fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL');

      const mailOptions = {
        from: options.from || `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent successfully to ${options.to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('Email service connection verification failed:', error);
      return false;
    }
  }

  async sendBulkEmails(
    recipients: string[],
    subject: string,
    text: string,
    html?: string,
  ): Promise<{ success: string[]; failed: string[] }> {
    const results: { success: string[]; failed: string[] } = { 
      success: [], 
      failed: [] 
    };

    for (const recipient of recipients) {
      try {
        await this.sendEmail({
          to: recipient,
          subject,
          text,
          html,
        });
        results.success.push(recipient);
      } catch (error) {
        this.logger.error(`Failed to send email to ${recipient}:`, error);
        results.failed.push(recipient);
      }
    }

    this.logger.log(
      `Bulk email completed: ${results.success.length} successful, ${results.failed.length} failed`,
    );
    
    return results;
  }

  replaceTemplateVariables(template: string, data: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    }
    
    return result;
  }

  validateTemplateVariables(template: string, requiredVariables: string[]): string[] {
    const missingVariables: string[] = [];
    
    for (const variable of requiredVariables) {
      const regex = new RegExp(`{{\\s*${variable}\\s*}}`, 'g');
      if (!regex.test(template)) {
        missingVariables.push(variable);
      }
    }
    
    return missingVariables;
  }
}
