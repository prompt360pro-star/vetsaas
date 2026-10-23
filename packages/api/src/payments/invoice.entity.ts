// ============================================================================
// Invoice Entity — Multi-tenant, Angola fiscal
// ============================================================================

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
} from 'typeorm';

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    category?: string;
}

@Entity('invoices')
@Index(['tenantId'])
@Index(['tenantId', 'status'])
@Index(['invoiceNumber'], { unique: true })
export class InvoiceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    tenantId!: string;

    @Column('uuid')
    tutorId!: string;

    @Column({ length: 255 })
    tutorName!: string;

    @Column({ length: 30, unique: true })
    invoiceNumber!: string; // FAT-2025-000001

    @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
    items!: InvoiceLineItem[];

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    subtotal!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    tax!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    total!: number;

    @Column({ length: 3, default: 'AOA' })
    currency!: string;

    @Column({ length: 20, default: 'DRAFT' })
    status!: string; // DRAFT | SENT | PAID | PARTIALLY_PAID | OVERDUE | CANCELLED

    @Column({ type: 'date', nullable: true })
    dueDate!: Date;

    @Column({ type: 'timestamp', nullable: true })
    paidAt!: Date;

    @Column({ type: 'uuid', nullable: true })
    paymentId!: string; // Linked payment

    @Column({ type: 'text', nullable: true })
    notes!: string;

    @Column({ type: 'text', nullable: true })
    cancellationReason!: string;

    @Column({ type: 'uuid', nullable: true })
    createdBy!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
