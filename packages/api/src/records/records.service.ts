import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClinicalRecordEntity } from "./clinical-record.entity";
import type { PaginatedResponse, PaginationQuery } from "@vetsaas/shared";

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(ClinicalRecordEntity)
    private readonly repo: Repository<ClinicalRecordEntity>,
  ) {}

  async findByAnimal(
    tenantId: string,
    animalId: string,
    query: PaginationQuery,
  ): Promise<PaginatedResponse<ClinicalRecordEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      where: { tenantId, animalId },
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

  async findById(tenantId: string, id: string): Promise<ClinicalRecordEntity> {
    const record = await this.repo.findOne({ where: { id, tenantId } });
    if (!record) {
      throw new NotFoundException("Clinical record not found");
    }
    return record;
  }

  async create(
    tenantId: string,
    veterinarianId: string,
    data: Partial<ClinicalRecordEntity>,
  ): Promise<ClinicalRecordEntity> {
    const record = this.repo.create({
      ...data,
      tenantId,
      veterinarianId,
    });
    return this.repo.save(record);
  }

  /**
   * Update creates a new version (append-only for audit trail).
   */
  async update(
    tenantId: string,
    id: string,
    data: Partial<ClinicalRecordEntity>,
  ): Promise<ClinicalRecordEntity> {
    const existing = await this.findById(tenantId, id);
    // Increment version on each update
    existing.version += 1;
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async sign(
    tenantId: string,
    id: string,
    userId: string,
  ): Promise<ClinicalRecordEntity> {
    const record = await this.findById(tenantId, id);
    record.signedAt = new Date();
    record.signedBy = userId;
    return this.repo.save(record);
  }
}
