import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

/**
 * Consent tracking for Lei n.º 22/11 compliance.
 * Records all consent grants and revocations per tutor.
 */
@Entity("consents")
@Index(["tenantId", "tutorId"])
export class ConsentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column("uuid")
  tutorId: string;

  @Column({ length: 50 })
  consentType: string;

  @Column({ type: "int", default: 1 })
  version: number;

  @CreateDateColumn()
  grantedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  revokedAt: Date;

  @Column({ length: 50, nullable: true })
  ipAddress: string;

  @Column({ type: "text", nullable: true })
  details: string;
}
