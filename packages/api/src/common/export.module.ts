import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalEntity } from '../animals/animal.entity';
import { PaymentEntity } from '../payments/payment.entity';
import { AuditLogEntity } from './audit-log.entity';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnimalEntity, PaymentEntity, AuditLogEntity]),
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
