import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('animals')
@Index(['tenantId'])
export class AnimalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50 })
  species: string;

  @Column({ length: 100, nullable: true })
  breed: string;

  @Column({ length: 100, nullable: true })
  color: string;

  @Column({ length: 20, default: 'UNKNOWN' })
  sex: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ length: 50, nullable: true })
  estimatedAge: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight: number;

  @Column({ length: 5, default: 'kg' })
  weightUnit: string;

  @Column({ length: 50, nullable: true, unique: true })
  microchipId: string;

  @Column({ length: 100, nullable: true })
  pedigreeNumber: string;

  @Column({ type: 'text', nullable: true })
  photoUrl: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  photos: string[];

  @Column({ default: false })
  isNeutered: boolean;

  @Column({ default: false })
  isDeceased: boolean;

  @Column({ type: 'date', nullable: true })
  deceasedDate: Date;

  @Column({ length: 20, nullable: true })
  bloodType: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  tutorIds: string[];

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
