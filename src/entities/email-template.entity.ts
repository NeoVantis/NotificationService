import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('email_templates')
@Index(['name'])
@Index(['isActive'])
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 255 })
  subject: string;

  @Column('text')
  textContent: string;

  @Column('text')
  htmlContent: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column('jsonb', { nullable: true })
  defaultData: Record<string, any>;

  @Column('jsonb', { nullable: true })
  requiredVariables: string[];

  @Column({ length: 100, nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
