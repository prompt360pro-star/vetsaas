import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

/**
 * Immutable audit log — append-only.
 * Tracks all significant actions for compliance (Lei n.º 22/11).
 */
@Entity("audit_logs")
@Index(["tenantId", "createdAt"])
@Index(["entityType", "entityId"])
export class AuditLogEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  tenantId!: string;

  @Column("uuid")
  userId!: string;

  @Column({ length: 100 })
  action!: string; // CREATE, UPDATE, DELETE, LOGIN, EXPORT, SIGN, etc.

  @Column({ length: 100 })
  entityType!: string; // animal, tutor, record, appointment, etc.

  @Column({ type: "uuid", nullable: true })
  entityId!: string | null;

  @Column({ type: "jsonb", nullable: true })
  oldValues!: Record<string, unknown> | null;

  @Column({ type: "jsonb", nullable: true })
  newValues!: Record<string, unknown> | null;

  @Column({ length: 50, nullable: true })
  ipAddress!: string | null;

  @Column({ type: "text", nullable: true })
  userAgent!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
