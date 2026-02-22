import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { RequestLoggerMiddleware } from './common/request-logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AnimalsModule } from './animals/animals.module';
import { TutorsModule } from './tutors/tutors.module';
import { RecordsModule } from './records/records.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { TenantsModule } from './tenants/tenants.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StorageModule } from './storage/storage.module';
import { PaymentsModule } from './payments/payments.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuditModule } from './common/audit.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExportModule } from './common/export.module';
import { SearchModule } from './common/search.module';

// Entities
import { TenantEntity } from './tenants/tenant.entity';
import { UserEntity } from './auth/user.entity';
import { AnimalEntity } from './animals/animal.entity';
import { TutorEntity } from './tutors/tutor.entity';
import { ClinicalRecordEntity } from './records/clinical-record.entity';
import { AppointmentEntity } from './appointments/appointment.entity';
import { AuditLogEntity } from './common/audit-log.entity';
import { ConsentEntity } from './common/consent.entity';
import { PaymentEntity } from './payments/payment.entity';
import { InvoiceEntity } from './payments/invoice.entity';
import { InventoryItemEntity } from './inventory/inventory-item.entity';
import { StockMovementEntity } from './inventory/stock-movement.entity';
import { LabResultEntity } from './records/lab-result.entity';
import { DeviceTokenEntity } from './notifications/device-token.entity';

@Module({
    imports: [
        // Config
        ConfigModule.forRoot({ isGlobal: true }),

        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('DATABASE_HOST', 'localhost'),
                port: config.get<number>('DATABASE_PORT', 5432),
                username: config.get('DATABASE_USER', 'vetsaas'),
                password: config.get('DATABASE_PASSWORD', 'vetsaas_dev_2024'),
                database: config.get('DATABASE_NAME', 'vetsaas'),
                entities: [
                    TenantEntity,
                    UserEntity,
                    AnimalEntity,
                    TutorEntity,
                    ClinicalRecordEntity,
                    AppointmentEntity,
                    AuditLogEntity,
                    ConsentEntity,
                    PaymentEntity,
                    InvoiceEntity,
                    InventoryItemEntity,
                    StockMovementEntity,
                    LabResultEntity,
                    DeviceTokenEntity,
                ],
                synchronize: config.get('NODE_ENV') === 'development',
                logging: config.get('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
        }),

        // Feature modules
        AuthModule,
        TenantsModule,
        AnimalsModule,
        TutorsModule,
        RecordsModule,
        AppointmentsModule,
        NotificationsModule,
        StorageModule,
        PaymentsModule,
        InventoryModule,
        AuditModule,
        DashboardModule,
        ExportModule,
        SearchModule,
    ],
    controllers: [HealthController],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    }
}
