// ============================================================================
// Payments Module
// ============================================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './payment.entity';
import { InvoiceEntity } from './invoice.entity';
import { PaymentsService } from './payments.service';
import { InvoicesService } from './invoices.service';
import { PaymentsController } from './payments.controller';
import { InvoicesController } from './invoices.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentEntity, InvoiceEntity]),
    ],
    controllers: [PaymentsController, InvoicesController],
    providers: [PaymentsService, InvoicesService],
    exports: [PaymentsService, InvoicesService],
})
export class PaymentsModule { }
