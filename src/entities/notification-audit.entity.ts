import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  EMAIL_SENT = 'email_sent',
  EMAIL_FAILED = 'email_failed',
  BULK_EMAIL_STARTED = 'bulk_email_started',
  BULK_EMAIL_COMPLETED = 'bulk_email_completed',
  TEMPLATE_CREATED = 'template_created',
  TEMPLATE_UPDATED = 'template_updated',
  TEMPLATE_DELETED = 'template_deleted',
}

@Entity('notification_audit')
@Index(['action', 'createdAt'])
@Index(['recipientEmail'])
@Index(['userId'])
export class NotificationAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ length: 255, nullable: true })
  userId?: string; // The user who triggered the action

  @Column({ length: 255, nullable: true })
  recipientEmail?: string;

  @Column({ length: 255, nullable: true })
  notificationId?: string;

  @Column('text', { nullable: true })
  details?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 500, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
