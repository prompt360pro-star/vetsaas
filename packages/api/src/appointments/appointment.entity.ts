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
    reason: string | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ default: false })
    isTeleconsult: boolean;

    @Column({ type: 'text', nullable: true })
    teleconsultUrl: string | null;

    @Column({ type: 'timestamp', nullable: true })
    checkedInAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    startedAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    cancelledAt: Date | null;

    @Column({ type: 'text', nullable: true })
    cancellationReason: string | null;

    @Column({ type: 'uuid', nullable: true })
    createdBy: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
