// ============================================================================
// Export Service — CSV generation for animals, payments, audit logs
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Readable } from 'stream';
import { AnimalEntity } from '../animals/animal.entity';
import { PaymentEntity } from '../payments/payment.entity';
import { AuditLogEntity } from './audit-log.entity';

@Injectable()
export class ExportService {
    constructor(
        @InjectRepository(AnimalEntity)
        private readonly animalsRepo: Repository<AnimalEntity>,
        @InjectRepository(PaymentEntity)
        private readonly paymentsRepo: Repository<PaymentEntity>,
        @InjectRepository(AuditLogEntity)
        private readonly auditRepo: Repository<AuditLogEntity>,
    ) { }

    /**
     * Export animals as CSV.
     */
    async exportAnimals(tenantId: string): Promise<string> {
        const animals = await this.animalsRepo.find({
            where: { tenantId },
            order: { name: 'ASC' },
        });

        const header = 'Nome,Espécie,Raça,Sexo,Peso,Microchip,Castrado,Criado em';
        const rows = animals.map((a) =>
            [
                this.esc(a.name),
                this.esc(a.species),
                this.esc(a.breed || ''),
                this.esc(a.sex),
                a.weight ? `${a.weight} ${a.weightUnit}` : '',
                this.esc(a.microchipId || ''),
                a.isNeutered ? 'Sim' : 'Não',
                this.fmtDate(a.createdAt),
            ].join(','),
        );

        return [header, ...rows].join('\n');
    }

    /**
     * Export payments as CSV with optional date range.
     */
    async exportPayments(tenantId: string, startDate?: Date, endDate?: Date): Promise<Readable> {
        const where: Record<string, unknown> = { tenantId };
        if (startDate && endDate) {
            where.createdAt = Between(startDate, endDate);
        }

        const self = this;
        async function* generate() {
            const header = 'Data,Valor,Moeda,Método,Estado,Referência,Descrição';
            yield header + '\n';

            const BATCH_SIZE = 1000;
            let skip = 0;
            let hasMore = true;

            while (hasMore) {
                const payments = await self.paymentsRepo.find({
                    where,
                    order: { createdAt: 'DESC' },
                    take: BATCH_SIZE,
                    skip,
                });

                if (payments.length === 0) {
                    hasMore = false;
                    break;
                }

                for (const p of payments) {
                    yield [
                        self.fmtDate(p.createdAt),
                        p.amount.toString(),
                        self.esc(p.currency),
                        self.esc(p.method),
                        self.esc(p.status),
                        self.esc(p.referenceCode || ''),
                        self.esc(p.description || ''),
                    ].join(',') + '\n';
                }

                skip += payments.length;
                if (payments.length < BATCH_SIZE) {
                    hasMore = false;
                }
            }
        }

        return Readable.from(generate());
    }

    /**
     * Export audit logs as CSV.
     */
    async exportAudit(tenantId: string, limit: number = 500): Promise<string> {
        const logs = await this.auditRepo.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            take: Math.min(limit, 1000),
        });

        const header = 'Timestamp,Utilizador,Acção,Entidade,ID Entidade';
        const rows = logs.map((l) =>
            [
                this.fmtDate(l.createdAt),
                this.esc(l.userId),
                this.esc(l.action),
                this.esc(l.entityType),
                this.esc(l.entityId || ''),
            ].join(','),
        );

        return [header, ...rows].join('\n');
    }

    /** Escape CSV field (wrap in quotes if contains comma/quote/newline). */
    private esc(value: string): string {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    /** Format date as dd/MM/yyyy HH:mm. */
    private fmtDate(d: Date): string {
        if (!d) return '';
        const dt = new Date(d);
        const day = String(dt.getDate()).padStart(2, '0');
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const year = dt.getFullYear();
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
}
