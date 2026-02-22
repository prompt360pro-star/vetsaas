// ============================================================================
// Payments Service — Multi-tenant, Angola payment methods
// ============================================================================

import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { PaymentEntity, PaymentMethod, PaymentStatus } from "./payment.entity";
import type {
  PaginatedResponse,
  PaginationQuery,
} from "@vetsaas/shared";

export interface CreatePaymentInput {
  invoiceId?: string;
  amount: number;
  method: string;
  gateway?: string;
  description?: string;
  tutorName?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentSummary {
  totalRevenue: number;
  totalPending: number;
  totalCompleted: number;
  totalFailed: number;
  averageTicket: number;
  count: number;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repo: Repository<PaymentEntity>,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    input: CreatePaymentInput,
  ): Promise<PaymentEntity> {
    const referenceCode = this.generateReference(input.method);

    const payment = this.repo.create({
      tenantId,
      invoiceId: input.invoiceId,
      amount: input.amount,
      currency: "AOA",
      method: input.method as PaymentMethod,
      gateway: input.gateway || "MANUAL",
      status: (input.method === "CASH" ? PaymentStatus.COMPLETED : PaymentStatus.PENDING),
      referenceCode,
      description: input.description,
      tutorName: input.tutorName,
      metadata: input.metadata,
      paidAt: input.method === "CASH" ? new Date() : undefined,
      createdBy: userId,
    });

    const saved = await this.repo.save(payment);

    this.logger.log(
      `[PAYMENT] Created ${saved.id} | ${input.method} | ${input.amount} AOA | Tenant: ${tenantId}`,
    );

    return saved;
  }

  async findAll(
    tenantId: string,
    query: PaginationQuery & {
      status?: string;
      method?: string;
      from?: string;
      to?: string;
    },
  ): Promise<PaginatedResponse<PaymentEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (query.status) where.status = query.status;
    if (query.method) where.method = query.method;
    if (query.from && query.to) {
      where.createdAt = Between(new Date(query.from), new Date(query.to));
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<PaymentEntity> {
    const payment = await this.repo.findOne({ where: { id, tenantId } });
    if (!payment) {
      throw new NotFoundException("Pagamento não encontrado");
    }
    return payment;
  }

  async getSummary(tenantId: string): Promise<PaymentSummary> {
    const result = await this.repo
      .createQueryBuilder("p")
      .select([
        'COUNT(*)::int as "count"',
        "COALESCE(SUM(CASE WHEN p.status = 'COMPLETED' THEN p.amount ELSE 0 END), 0)::numeric as \"totalCompleted\"",
        "COALESCE(SUM(CASE WHEN p.status = 'PENDING' THEN p.amount ELSE 0 END), 0)::numeric as \"totalPending\"",
        "COALESCE(SUM(CASE WHEN p.status = 'FAILED' THEN p.amount ELSE 0 END), 0)::numeric as \"totalFailed\"",
        'COALESCE(SUM(p.amount), 0)::numeric as "totalRevenue"',
      ])
      .where('p."tenantId" = :tenantId', { tenantId })
      .getRawOne();

    const count = Number(result?.count) || 0;

    return {
      totalRevenue: Number(result?.totalRevenue) || 0,
      totalPending: Number(result?.totalPending) || 0,
      totalCompleted: Number(result?.totalCompleted) || 0,
      totalFailed: Number(result?.totalFailed) || 0,
      averageTicket: count > 0 ? Number(result?.totalRevenue) / count : 0,
      count,
    };
  }

  async processWebhook(
    gateway: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    // TODO: Integrate with Multicaixa GPO / Unitel Money webhook
    this.logger.log(
      `[WEBHOOK STUB] Gateway: ${gateway} | Payload: ${JSON.stringify(payload)}`,
    );

    const referenceCode = payload.referenceCode as string;
    if (!referenceCode) return;

    const payment = await this.repo.findOne({ where: { referenceCode } });
    if (!payment) {
      this.logger.warn(
        `[WEBHOOK] Payment not found for reference: ${referenceCode}`,
      );
      return;
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.paidAt = new Date();
    payment.transactionId =
      (payload.transactionId as string) || `txn_${Date.now()}`;
    await this.repo.save(payment);

    this.logger.log(`[WEBHOOK] Payment ${payment.id} marked as COMPLETED`);
  }

  // ── Helpers ─────────────────────────────────────────

  private generateReference(method: string): string | undefined {
    if (method === "MULTICAIXA_REFERENCE" || method === "MULTICAIXA_EXPRESS") {
      // Multicaixa reference: entity + reference number
      // TODO: Integrate with actual Multicaixa GPO API
      const entity = "00000"; // Stub entity code
      const ref = String(Math.floor(Math.random() * 999999999)).padStart(
        9,
        "0",
      );
      return `${entity}${ref}`;
    }
    if (method === "UNITEL_MONEY") {
      return `UM${Date.now()}`;
    }
    return undefined;
  }
}
