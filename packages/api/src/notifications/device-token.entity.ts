import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum DevicePlatform {
    ANDROID = 'ANDROID',
    IOS = 'IOS',
    WEB = 'WEB',
}

@Entity('device_tokens')
@Index(['userId'])
export class DeviceTokenEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    userId: string;

    @Column({ unique: true })
    token: string;

    @Column({ length: 20, default: 'WEB' })
    platform: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
