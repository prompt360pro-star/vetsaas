// ============================================================================
// Stock Movement Entity — Audit trail for inventory changes
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('stock_movements')
@Index(['tenantId', 'itemId'])
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  itemId: string;

  @Column({ length: 20 })
  type: string; // IN | OUT | ADJUSTMENT

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  previousStock: number;

  @Column({ type: 'int' })
  newStock: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column('uuid')
  performedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
