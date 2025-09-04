import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms', // For future use
  PUSH = 'push', // For future use
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('notifications')
@Index(['status', 'createdAt'])
@Index(['recipientEmail'])
@Index(['notificationType', 'status'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.EMAIL,
  })
  notificationType: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({ length: 255 })
  recipientEmail: string;

  @Column({ length: 255, nullable: true })
  recipientName?: string;

  @Column({ length: 500 })
  subject: string;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  htmlContent?: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column('text', { nullable: true })
  errorMessage?: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column({ length: 100, nullable: true })
  templateName?: string;

  @Column('jsonb', { nullable: true })
  templateData?: Record<string, any>;

  @Column({ length: 100, nullable: true })
  campaignId?: string;

  @Column({ length: 255, nullable: true })
  externalId?: string; // For tracking with external services

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
