// ============================================================================
// Lab Result Entity — Linked to clinical records
// ============================================================================

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('lab_results')
@Index(['tenantId', 'animalId'])
@Index(['tenantId', 'recordId'])
export class LabResultEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    tenantId!: string;

    @Column('uuid')
    animalId!: string;

    @Column({ type: 'uuid', nullable: true })
    recordId!: string; // Linked clinical record

    @Column({ length: 255 })
    testName!: string;

    @Column({ length: 50 })
    testType!: string; // BLOOD, URINE, IMAGING, BIOPSY, PARASITOLOGY, OTHER

    @Column({ type: 'text', nullable: true })
    result!: string;

    @Column({ length: 100, nullable: true })
    normalRange!: string; // e.g. "4.0-10.0"

    @Column({ length: 30, nullable: true })
    unit!: string; // e.g. "mg/dL"

    @Column({ length: 20, default: 'PENDING' })
    status!: string; // PENDING | IN_PROGRESS | COMPLETED | CANCELLED

    @Column({ type: 'text', nullable: true })
    notes!: string;

    @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
    attachmentUrls!: string[];

    @Column({ type: 'uuid', nullable: true })
    orderedBy!: string; // Vet who ordered

    @Column({ type: 'timestamp', nullable: true })
    performedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
