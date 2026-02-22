import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { AnimalEntity } from './animal.entity';
import type { PaginatedResponse, PaginationQuery } from '@vetsaas/shared';

@Injectable()
export class AnimalsService {
  constructor(
    @InjectRepository(AnimalEntity)
    private readonly repo: Repository<AnimalEntity>,
  ) {}

  async findAll(
    tenantId: string,
    query: PaginationQuery,
  ): Promise<PaginatedResponse<AnimalEntity>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (query.search) {
      where.name = ILike(`%${query.search}%`);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      skip,
      take: limit,
      order: { [query.sortBy || 'createdAt']: query.sortOrder || 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<AnimalEntity> {
    const animal = await this.repo.findOne({ where: { id, tenantId } });
    if (!animal) {
      throw new NotFoundException('Animal not found');
    }
    return animal;
  }

  async create(
    tenantId: string,
    userId: string,
    data: Partial<AnimalEntity>,
  ): Promise<AnimalEntity> {
    const animal = this.repo.create({
      ...data,
      tenantId,
      createdBy: userId,
    });
    return this.repo.save(animal);
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<AnimalEntity>,
  ): Promise<AnimalEntity> {
    const animal = await this.findById(tenantId, id);
    Object.assign(animal, data);
    return this.repo.save(animal);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const animal = await this.findById(tenantId, id);
    await this.repo.softRemove(animal);
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.repo.count({ where: { tenantId } });
  }
}
