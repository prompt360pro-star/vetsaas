import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, FindOptionsWhere } from "typeorm";
import { AuditLogEntity } from "./audit-log.entity";

export interface AuditLogInput {
  tenantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditQueryFilters {
  entityType?: string;
  action?: string;
  userId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) {}

  /**
   * Append an immutable audit log entry.
   */
  async log(input: AuditLogInput): Promise<AuditLogEntity> {
    const entry = this.repo.create({
      tenantId: input.tenantId,
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      oldValues: input.oldValues ?? null,
      newValues: input.newValues ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });
    const saved = await this.repo.save(entry);
    this.logger.debug(
      `[AUDIT] ${input.action} ${input.entityType} by ${input.userId}`,
    );
    return saved;
  }

  /**
   * Query audit logs for a tenant with optional filters.
   */
  async findByTenant(
    tenantId: string,
    filters: AuditQueryFilters = {},
  ): Promise<{
    data: AuditLogEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<AuditLogEntity> = { tenantId };

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.from && filters.to) {
      where.createdAt = Between(filters.from, filters.to);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get change history for a specific entity.
   */
  async findByEntity(
    tenantId: string,
    entityType: string,
    entityId: string,
  ): Promise<AuditLogEntity[]> {
    return this.repo.find({
      where: { tenantId, entityType, entityId },
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  /**
   * Get recent activity for a tenant (used by dashboard).
   */
  async getRecentActivity(
    tenantId: string,
    limit = 10,
  ): Promise<AuditLogEntity[]> {
    return this.repo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }
}
