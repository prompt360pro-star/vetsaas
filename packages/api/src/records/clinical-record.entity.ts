import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('clinical_records')
@Index(['tenantId', 'animalId'])
export class ClinicalRecordEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    tenantId!: string;

    @Column('uuid')
    animalId!: string;

    @Column('uuid')
    veterinarianId!: string;

    @Column({ type: 'uuid', nullable: true })
    appointmentId!: string;

    @Column({ type: 'int', default: 1 })
    version!: number;

    @Column({ length: 50, default: 'CONSULTATION' })
    recordType!: string;

    @Column({ type: 'text', nullable: true })
    subjective!: string;

    @Column({ type: 'text', nullable: true })
    objective!: string;

    @Column({ type: 'text', nullable: true })
    assessment!: string;

    @Column({ type: 'text', nullable: true })
    plan!: string;

    @Column({ type: 'jsonb', nullable: true })
    vitals!: Record<string, unknown>;

    @Column({ type: 'uuid', nullable: true })
    templateId!: string;

    @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
    tags!: string[];

    @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
    attachments!: string[];

    @Column({ type: 'timestamp', nullable: true })
    signedAt!: Date;

    @Column({ type: 'uuid', nullable: true })
    signedBy!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
