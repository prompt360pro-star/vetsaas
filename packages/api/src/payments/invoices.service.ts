import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InvoiceEntity, InvoiceStatus, InvoiceLineItem } from "./invoice.entity";

export interface CreateInvoiceInput {
  tutorId: string;
  tutorName: string;
  dueDate?: string;
  items: InvoiceLineItem[];
  notes?: string;
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly repo: Repository<InvoiceEntity>,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    input: CreateInvoiceInput,
  ): Promise<InvoiceEntity> {
    const total = input.items.reduce(
      (sum, item) => sum + item.total,
      0,
    );

    const invoice = this.repo.create({
      tenantId,
      tutorId: input.tutorId,
      tutorName: input.tutorName,
      invoiceNumber: `INV-${Date.now()}`, // Simple stub
      items: input.items,
      subtotal: total,
      tax: 0,
      total: total,
      paidAmount: 0,
      status: InvoiceStatus.DRAFT,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      notes: input.notes,
      createdBy: userId,
    });

    return this.repo.save(invoice);
  }

  async findById(tenantId: string, id: string): Promise<InvoiceEntity> {
    const invoice = await this.repo.findOne({ where: { id, tenantId } });
    if (!invoice) throw new NotFoundException("Invoice not found");
    return invoice;
  }

  async markAsPaid(tenantId: string, id: string): Promise<InvoiceEntity> {
    const invoice = await this.findById(tenantId, id);
    invoice.status = InvoiceStatus.PAID;
    invoice.paidAmount = invoice.total;
    invoice.paidAt = new Date();
    return this.repo.save(invoice);
  }

  async markAsSent(tenantId: string, id: string): Promise<InvoiceEntity> {
    const invoice = await this.findById(tenantId, id);
    invoice.status = InvoiceStatus.SENT;
    return this.repo.save(invoice);
  }

  async cancel(tenantId: string, id: string, reason: string): Promise<InvoiceEntity> {
    const invoice = await this.findById(tenantId, id);
    invoice.status = InvoiceStatus.CANCELLED;
    invoice.cancellationReason = reason;
    return this.repo.save(invoice);
  }
}
