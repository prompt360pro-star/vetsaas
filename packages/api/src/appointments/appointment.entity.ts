import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('appointments')
@Index(['tenantId', 'scheduledAt'])
export class AppointmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  animalId: string;

  @Column('uuid')
  tutorId: string;

  @Column('uuid')
  veterinarianId: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'int', default: 30 })
  duration: number;

  @Column({ length: 50, default: 'CONSULTATION' })
  appointmentType: string;

  @Column({ length: 30, default: 'SCHEDULED' })
  status: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isTeleconsult: boolean;

  @Column({ type: 'text', nullable: true })
  teleconsultUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  checkedInAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
