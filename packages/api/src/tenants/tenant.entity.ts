import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';

@Entity('tenants')
export class TenantEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 255 })
    name!: string;

    @Column({ length: 100, unique: true })
    slug!: string;

    @Column({ length: 255 })
    email!: string;

    @Column({ length: 50, nullable: true })
    phone!: string;

    @Column({ type: 'text', nullable: true })
    address!: string;

    @Column({ length: 100, nullable: true })
    city!: string;

    @Column({ length: 100, nullable: true })
    province!: string;

    @Column({ length: 10, default: 'AO' })
    country!: string;

    @Column({ type: 'text', nullable: true })
    logoUrl!: string;

    @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
    settings!: Record<string, unknown>;

    @Column({ length: 50, default: 'STARTER' })
    plan!: string;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}
