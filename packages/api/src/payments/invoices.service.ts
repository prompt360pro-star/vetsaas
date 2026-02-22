// ============================================================================
// Invoices Service — Multi-tenant, auto-numbering
// ============================================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity, InvoiceLineItem } from './invoice.entity';
import type { PaginatedResponse, PaginationQuery } from '@vetsaas/shared';
import { generateReadableId } from '@vetsaas/shared';

export interface CreateInvoiceInput {
  tutorId: string;
  tutorName: string;
  items: InvoiceLineItem[];
  dueDate?: string;
  notes?: string;
  taxRate?: number; // 0-100, default 14% IVA Angola
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly repo: Repository<InvoiceEntity>,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    input: CreateInvoiceInput,
  ): Promise<InvoiceEntity> {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('A fatura deve conter pelo menos um item');
    }

    // Calculate totals
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const taxRate = input.taxRate ?? 14; // IVA Angola default 14%
    const tax = Math.round(subtotal * taxRate) / 100;
    const total = subtotal + tax;

    // Compute items with totals
    const items: InvoiceLineItem[] = input.items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));

    // Generate invoice number
    const sequence = await this.getNextSequence(tenantId);
    const invoiceNumber = generateReadableId('FAT', sequence);

    const invoice = this.repo.create({
      tenantId,
      tutorId: input.tutorId,
      tutorName: input.tutorName,
      invoiceNumber,
      items,
      subtotal,
      tax,
      total,
      currency: 'AOA',
      status: 'DRAFT',
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      notes: input.notes,
      createdBy: userId,
    });

    const saved = await this.repo.save(invoice);

    this.logger.log(
      `[INVOICE] Created ${invoiceNumber} | ${total} AOA | Tutor: ${input.tutorName} | Tenant: ${tenantId}`,
    );

    return saved;
  }

  async findAll(
    tenantId: string,
    query: PaginationQuery & { status?: string },
  ): Promise<PaginatedResponse<InvoiceEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (query.status) where.status = query.status;

    const [data, total] = await this.repo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<InvoiceEntity> {
    const invoice = await this.repo.findOne({ where: { id, tenantId } });
    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }
    return invoice;
  }

  async markAsPaid(
    tenantId: string,
    id: string,
    paymentId: string,
  ): Promise<InvoiceEntity> {
    const invoice = await this.findById(tenantId, id);

    if (invoice.status === 'CANCELLED') {
      throw new BadRequestException(
        'Não é possível pagar uma fatura cancelada',
      );
    }

    invoice.status = 'PAID';
    invoice.paidAt = new Date();
    invoice.paymentId = paymentId;

    return this.repo.save(invoice);
  }

  async send(tenantId: string, id: string): Promise<InvoiceEntity> {
    const invoice = await this.findById(tenantId, id);

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException(
        'Apenas faturas em rascunho podem ser enviadas',
      );
    }

    invoice.status = 'SENT';
    return this.repo.save(invoice);
  }

  async cancel(
    tenantId: string,
    id: string,
    reason?: string,
  ): Promise<InvoiceEntity> {
    const invoice = await this.findById(tenantId, id);

    if (invoice.status === 'PAID') {
      throw new BadRequestException(
        'Não é possível cancelar uma fatura já paga',
      );
    }

    invoice.status = 'CANCELLED';
    invoice.cancellationReason = reason || 'Cancelada pelo utilizador';

    return this.repo.save(invoice);
  }

  // ── Helpers ─────────────────────────────────────────

  private async getNextSequence(tenantId: string): Promise<number> {
    const count = await this.repo.count({
      where: { tenantId },
      withDeleted: true,
    });
    return count + 1;
  }
}
