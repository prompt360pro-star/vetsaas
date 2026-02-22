import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ClinicalRecordEntity } from './clinical-record.entity';
import { InventoryItemEntity } from '../inventory/inventory-item.entity';

export interface ClinicalAlert {
    id: string;
    type: 'WARNING' | 'DANGER' | 'INFO';
    category: string;
    title: string;
    description: string;
    entityType: string;
    entityId?: string;
    entityName?: string;
    createdAt: Date;
}

// Normal vital ranges by species
const VITAL_RANGES: Record<
    string,
    Record<string, { min: number; max: number; unit: string }>
> = {
    DOG: {
        temperature: { min: 38.0, max: 39.2, unit: '°C' },
        heartRate: { min: 60, max: 140, unit: 'bpm' },
        respiratoryRate: { min: 10, max: 30, unit: 'rpm' },
    },
    CAT: {
        temperature: { min: 38.0, max: 39.5, unit: '°C' },
        heartRate: { min: 140, max: 220, unit: 'bpm' },
        respiratoryRate: { min: 20, max: 40, unit: 'rpm' },
    },
};

@Injectable()
export class ClinicalAlertsService {
    private readonly logger = new Logger(ClinicalAlertsService.name);

    constructor(
        @InjectRepository(ClinicalRecordEntity)
        private readonly recordsRepo: Repository<ClinicalRecordEntity>,
        @InjectRepository(InventoryItemEntity)
        private readonly inventoryRepo: Repository<InventoryItemEntity>,
    ) {}

    /**
     * Evaluate all clinical rules and return active alerts for a tenant.
     */
    async getAlerts(tenantId: string): Promise<ClinicalAlert[]> {
        const alerts: ClinicalAlert[] = [];

        const [unsignedAlerts, lowStockAlerts] = await Promise.all([
            this.checkUnsignedRecords(tenantId),
            this.checkLowInventory(tenantId),
        ]);

        alerts.push(...unsignedAlerts, ...lowStockAlerts);

        // Sort by severity: DANGER first, then WARNING, then INFO
        const severityOrder = { DANGER: 0, WARNING: 1, INFO: 2 };
        alerts.sort((a, b) => severityOrder[a.type] - severityOrder[b.type]);

        this.logger.debug(
            `[ALERTS] ${alerts.length} active alerts for tenant ${tenantId}`,
        );
        return alerts;
    }

    /**
     * Check for clinical records created more than 24h ago that haven't been signed.
     */
    async checkUnsignedRecords(tenantId: string): Promise<ClinicalAlert[]> {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const unsigned = await this.recordsRepo.find({
            where: {
                tenantId,
                signedAt: undefined,
                createdAt: LessThan(cutoff),
            },
            take: 20,
            order: { createdAt: 'ASC' },
        });

        return unsigned.map((r) => ({
            id: `unsigned-${r.id}`,
            type: 'WARNING' as const,
            category: 'UNSIGNED_RECORD',
            title: 'Prontuário não assinado',
            description: `Prontuário criado há mais de 24h sem assinatura digital`,
            entityType: 'record',
            entityId: r.id,
            createdAt: r.createdAt,
        }));
    }

    /**
     * Check for inventory items below minimum stock level.
     */
    async checkLowInventory(tenantId: string): Promise<ClinicalAlert[]> {
        const items = await this.inventoryRepo
            .createQueryBuilder('item')
            .where('item.tenantId = :tenantId', { tenantId })
            .andWhere('item.stock <= item.minStock')
            .andWhere('item.isActive = :active', { active: true })
            .getMany();

        return items.map((item) => ({
            id: `low-stock-${item.id}`,
            type: (item.stock === 0 ? 'DANGER' : 'WARNING') as
                | 'DANGER'
                | 'WARNING',
            category: 'LOW_STOCK',
            title: item.stock === 0 ? 'Stock esgotado' : 'Stock baixo',
            description: `${item.name}: ${item.stock}/${item.minStock} ${item.unit}`,
            entityType: 'inventory',
            entityId: item.id,
            entityName: item.name,
            createdAt: new Date(),
        }));
    }

    /**
     * Check vitals against normal ranges for a species.
     * This is a utility — called per-record, not batch.
     */
    checkVitals(
        species: string,
        vitals: Record<string, number>,
    ): ClinicalAlert[] {
        const ranges = VITAL_RANGES[species];
        if (!ranges) return [];

        const alerts: ClinicalAlert[] = [];

        for (const [key, value] of Object.entries(vitals)) {
            const range = ranges[key];
            if (!range) continue;

            if (value < range.min) {
                alerts.push({
                    id: `vital-low-${key}`,
                    type: 'WARNING',
                    category: 'ABNORMAL_VITAL',
                    title: `${key} abaixo do normal`,
                    description: `${value}${range.unit} (normal: ${range.min}–${range.max}${range.unit})`,
                    entityType: 'vital',
                    createdAt: new Date(),
                });
            } else if (value > range.max) {
                alerts.push({
                    id: `vital-high-${key}`,
                    type: value > range.max * 1.1 ? 'DANGER' : 'WARNING',
                    category: 'ABNORMAL_VITAL',
                    title: `${key} acima do normal`,
                    description: `${value}${range.unit} (normal: ${range.min}–${range.max}${range.unit})`,
                    entityType: 'vital',
                    createdAt: new Date(),
                });
            }
        }

        return alerts;
    }
}
