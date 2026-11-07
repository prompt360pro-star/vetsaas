// ============================================================================
// Inventory Item Entity — Multi-tenant, veterinary pharmacy
// ============================================================================

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('inventory_items')
@Index(['tenantId'])
@Index(['tenantId', 'category'])
@Index(['sku'], { unique: true, where: '"sku" IS NOT NULL' })
export class InventoryItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    tenantId!: string;

    @Column({ length: 255 })
    name!: string;

    @Column({ length: 30 })
    category!: string; // ANTIBIOTIC | VACCINE | ANESTHETIC | ...

    @Column({ length: 50, nullable: true })
    sku!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({ type: 'int', default: 0 })
    stock!: number;

    @Column({ type: 'int', default: 0 })
    minStock!: number;

    @Column({ length: 30 })
    unit!: string; // caixas, doses, frascos, unidades, etc.

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    price!: number; // Selling price in AOA

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    cost!: number; // Cost price in AOA

    @Column({ length: 255, nullable: true })
    supplier!: string;

    @Column({ type: 'date', nullable: true })
    expiryDate!: Date;

    @Column({ length: 50, nullable: true })
    batchNumber!: string;

    @Column({ default: false })
    isControlled!: boolean; // Controlled substance

    @Column({ default: true })
    isActive!: boolean;

    @Column({ type: 'uuid', nullable: true })
    createdBy!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
