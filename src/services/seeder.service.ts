import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../entities/email-template.entity';
import { defaultEmailTemplates } from '../templates/default-templates';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedEmailTemplates();
  }

  private async seedEmailTemplates(): Promise<void> {
    try {
      this.logger.log('Checking for default email templates...');

      for (const templateData of defaultEmailTemplates) {
        const existingTemplate = await this.emailTemplateRepository.findOne({
          where: { name: templateData.name },
        });

        if (!existingTemplate) {
          const template = this.emailTemplateRepository.create(templateData);
          await this.emailTemplateRepository.save(template);
          this.logger.log(`✓ Created default template: ${templateData.name}`);
        } else {
          this.logger.log(`→ Template already exists: ${templateData.name}`);
        }
      }

      this.logger.log('Default email templates check completed');
    } catch (error) {
      this.logger.error('Failed to seed email templates:', error);
    }
  }

  async seedTemplate(templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const existingTemplate = await this.emailTemplateRepository.findOne({
      where: { name: templateData.name },
    });

    if (existingTemplate) {
      throw new Error(`Template '${templateData.name}' already exists`);
    }

    const template = this.emailTemplateRepository.create(templateData);
    return await this.emailTemplateRepository.save(template);
  }

  async resetTemplates(): Promise<void> {
    this.logger.log('Resetting all email templates...');
    
    // Delete all existing templates
    await this.emailTemplateRepository.delete({});
    
    // Re-seed default templates
    await this.seedEmailTemplates();
    
    this.logger.log('Email templates reset completed');
  }
}
