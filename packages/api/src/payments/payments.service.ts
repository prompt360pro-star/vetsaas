// ============================================================================
// Payments Service — Multi-tenant, Angola payment methods
// ============================================================================

import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { PaymentEntity } from "./payment.entity";
import type { PaginatedResponse, PaginationQuery } from "@vetsaas/shared";

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
      method: input.method,
      gateway: input.gateway || "MANUAL",
      status: input.method === "CASH" ? "COMPLETED" : "PENDING",
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
    this.logger.log(
      `[WEBHOOK] Gateway: ${gateway} | Payload: ${JSON.stringify(payload)}`,
    );

    const payment = await this.findPaymentFromPayload(payload);

    if (!payment) {
      this.logger.warn(
        `[WEBHOOK] No matching payment found for payload: ${JSON.stringify(payload)}`,
      );
      return;
    }

    if (payment.status === "COMPLETED") {
      this.logger.log(`[WEBHOOK] Payment ${payment.id} already completed`);
      return;
    }

    // Logic for extracting status could go here if we had definitive docs.
    // For now, we assume if we found the payment and the webhook was fired, it's a success
    // unless status explicitly says otherwise (which we can check loosely).
    // Common failure indicators:
    const statusValues = Object.values(payload).map((v) =>
      String(v).toUpperCase(),
    );
    const isFailure = statusValues.some((v) =>
      ["FAILED", "ERROR", "CANCELLED", "REJECTED"].includes(v),
    );

    if (isFailure) {
      payment.status = "FAILED";
      payment.failedAt = new Date();
      payment.failureReason = JSON.stringify(payload); // Store payload as reason for debugging
      await this.repo.save(payment);
      this.logger.warn(
        `[WEBHOOK] Payment ${payment.id} marked as FAILED based on payload indicators`,
      );
      return;
    }

    payment.status = "COMPLETED";
    payment.paidAt = new Date();

    // Try to find a transaction ID
    const possibleTxIds = Object.entries(payload)
      .filter(
        ([k, v]) =>
          (k.toLowerCase().includes("transaction") ||
            k.toLowerCase().includes("id")) &&
          typeof v === "string",
      )
      .map(([, v]) => v as string);

    payment.transactionId = possibleTxIds[0] || `txn_${Date.now()}`;
    payment.gateway = gateway; // Update gateway source

    await this.repo.save(payment);

    this.logger.log(`[WEBHOOK] Payment ${payment.id} marked as COMPLETED`);
  }

  private async findPaymentFromPayload(
    payload: Record<string, unknown>,
  ): Promise<PaymentEntity | null> {
    // 1. Check explicit referenceCode field (legacy/stub behavior)
    if (payload.referenceCode && typeof payload.referenceCode === "string") {
      const payment = await this.repo.findOne({
        where: { referenceCode: payload.referenceCode },
      });
      if (payment) return payment;
    }

    // 2. Scan all string values for Multicaixa format (Entity + 9 digits = 14 digits approx, or just 9 digits if we strip entity)
    // Based on generateReference: entity='00000' + 9 digits. Length = 14.
    const stringValues = Object.values(payload).filter(
      (v) => typeof v === "string",
    ) as string[];

    for (const value of stringValues) {
      // Check for Multicaixa (14 digits starting with 00000, or generic 9+ digits)
      if (/^\d{9,14}$/.test(value)) {
        const payment = await this.repo.findOne({
          where: { referenceCode: value },
        });
        if (payment) return payment;
      }

      // Check for Unitel Money (starts with UM)
      if (value.startsWith("UM")) {
        const payment = await this.repo.findOne({
          where: { referenceCode: value },
        });
        if (payment) return payment;
      }
    }

    return null;
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
