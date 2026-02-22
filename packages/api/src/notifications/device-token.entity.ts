import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum DevicePlatform {
    ANDROID = 'android',
    IOS = 'ios',
    WEB = 'web',
}

@Entity('device_tokens')
@Index(['userId'])
export class DeviceTokenEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    userId: string;

    @Column({ type: 'text', unique: true })
    token: string;

    @Column({ type: 'enum', enum: DevicePlatform, default: DevicePlatform.WEB })
    platform: DevicePlatform;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
