// ============================================================================
// Export Service — CSV generation for animals, payments, audit logs
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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

        return this.generateCsv(
            animals,
            ['Nome', 'Espécie', 'Raça', 'Sexo', 'Peso', 'Microchip', 'Castrado', 'Criado em'],
            (a) => [
                a.name,
                a.species,
                a.breed || '',
                a.sex,
                a.weight ? `${a.weight} ${a.weightUnit}` : '',
                a.microchipId || '',
                a.isNeutered ? 'Sim' : 'Não',
                this.fmtDate(a.createdAt),
            ]
        );
    }

    /**
     * Export payments as CSV with optional date range.
     */
    async exportPayments(tenantId: string, startDate?: Date, endDate?: Date): Promise<string> {
        const where: Record<string, unknown> = { tenantId };
        if (startDate && endDate) {
            where.createdAt = Between(startDate, endDate);
        }

        const payments = await this.paymentsRepo.find({
            where,
            order: { createdAt: 'DESC' },
        });

        return this.generateCsv(
            payments,
            ['Data', 'Valor', 'Moeda', 'Método', 'Estado', 'Referência', 'Descrição'],
            (p) => [
                this.fmtDate(p.createdAt),
                p.amount.toString(),
                p.currency,
                p.method,
                p.status,
                p.referenceCode || '',
                p.description || '',
            ]
        );
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

        return this.generateCsv(
            logs,
            ['Timestamp', 'Utilizador', 'Acção', 'Entidade', 'ID Entidade'],
            (l) => [
                this.fmtDate(l.createdAt),
                l.userId,
                l.action,
                l.entityType,
                l.entityId || '',
            ]
        );
    }

    /** Generic CSV generator. */
    private generateCsv<T>(data: T[], headers: string[], rowMapper: (item: T) => string[]): string {
        const headerRow = headers.join(',');
        const rows = data.map((item) =>
            rowMapper(item)
                .map((field) => this.esc(field))
                .join(',')
        );
        return [headerRow, ...rows].join('\n');
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
