import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
} from 'typeorm';

@Entity('tutors')
@Index(['tenantId'])
@Index(['firstName'])
export class TutorEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    tenantId: string;

    @Column({ length: 100 })
    firstName: string;

    @Column({ length: 100 })
    lastName: string;

    @Column({ length: 255, nullable: true })
    email: string;

    @Column({ length: 50 })
    phone: string;

    @Column({ length: 50, nullable: true })
    phoneSecondary: string;

    @Column({ length: 20, nullable: true })
    documentType: string;

    @Column({ length: 50, nullable: true })
    documentNumber: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ length: 100, nullable: true })
    city: string;

    @Column({ length: 100, nullable: true })
    province: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
    animalIds: string[];

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'uuid', nullable: true })
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
