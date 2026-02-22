import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum PaymentMethod {
  MULTICAIXA = "MULTICAIXA_REFERENCE",
  MULTICAIXA_EXPRESS = "MULTICAIXA_EXPRESS",
  UNITEL_MONEY = "UNITEL_MONEY",
  BANK_TRANSFER = "BANK_TRANSFER",
  CASH = "CASH",
  POS = "POS",
  OTHER = "OTHER"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}

@Entity("payments")
@Index(["tenantId"])
@Index(["tenantId", "status"])
@Index(["referenceCode"], {
  unique: true,
  where: '"referenceCode" IS NOT NULL',
})
export class PaymentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column({ type: "uuid", nullable: true })
  invoiceId: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3, default: "AOA" })
  currency: string;

  @Column({
    type: "enum",
    enum: PaymentMethod,
    default: PaymentMethod.CASH
  })
  method: PaymentMethod;

  @Column({ length: 30, default: "MANUAL" })
  gateway: string;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column({ length: 50, nullable: true })
  referenceCode: string;

  @Column({ length: 100, nullable: true })
  transactionId: string;

  @Column({ type: "timestamp", nullable: true })
  paidAt: Date;

  @Column({ type: "timestamp", nullable: true })
  failedAt: Date;

  @Column({ type: "text", nullable: true })
  failureReason: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  tutorName: string;

  @Column({ type: "uuid", nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
