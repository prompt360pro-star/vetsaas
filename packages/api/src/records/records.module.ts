import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalRecordEntity } from './clinical-record.entity';
import { InventoryItemEntity } from '../inventory/inventory-item.entity';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { ClinicalAlertsService } from './clinical-alerts.service';
import { ClinicalAlertsController } from './clinical-alerts.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ClinicalRecordEntity, InventoryItemEntity])],
    controllers: [RecordsController, TemplatesController, ClinicalAlertsController],
    providers: [RecordsService, TemplatesService, ClinicalAlertsService],
    exports: [RecordsService, TemplatesService, ClinicalAlertsService],
})
export class RecordsModule { }

