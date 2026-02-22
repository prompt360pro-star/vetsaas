import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";

@Entity("users")
@Index(["tenantId", "email"], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 50, default: "VETERINARIAN" })
  role: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ type: "text", nullable: true })
  avatarUrl: string;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ type: "text", nullable: true })
  mfaSecret: string;

  @Column({ type: "text", nullable: true })
  refreshToken: string;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
