// ============================================================================
// Payment Entity — Multi-tenant, Angola-focused
// ============================================================================

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('payments')
@Index(['tenantId'])
@Index(['tenantId', 'status'])
@Index(['referenceCode'], { unique: true, where: '"referenceCode" IS NOT NULL' })
export class PaymentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    tenantId: string;

    @Column({ type: 'uuid', nullable: true })
    invoiceId: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ length: 3, default: 'AOA' })
    currency: string;

    @Column({ length: 30 })
    method: string; // MULTICAIXA_REFERENCE | MULTICAIXA_EXPRESS | UNITEL_MONEY | BANK_TRANSFER | CASH | POS | OTHER

    @Column({ length: 30, default: 'MANUAL' })
    gateway: string; // MULTICAIXA_GPO | UNITEL_MONEY | MANUAL | MOCK

    @Column({ length: 20, default: 'PENDING' })
    status: string; // PENDING | PROCESSING | COMPLETED | FAILED | REFUNDED | CANCELLED | EXPIRED

    @Column({ length: 50, nullable: true })
    referenceCode: string; // Multicaixa reference

    @Column({ length: 100, nullable: true })
    transactionId: string; // Gateway transaction ID

    @Column({ type: 'timestamp', nullable: true })
    paidAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    failedAt: Date;

    @Column({ type: 'text', nullable: true })
    failureReason: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, unknown>;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 255, nullable: true })
    tutorName: string;

    @Column({ type: 'uuid', nullable: true })
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
