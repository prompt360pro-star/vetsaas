import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { TutorEntity } from './tutor.entity';
import type { PaginatedResponse, PaginationQuery } from '@vetsaas/shared';

@Injectable()
export class TutorsService {
    constructor(
        @InjectRepository(TutorEntity)
        private readonly repo: Repository<TutorEntity>,
    ) {}

    async findAll(tenantId: string, query: PaginationQuery): Promise<PaginatedResponse<TutorEntity>> {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = { tenantId };
        if (query.search) {
            where.firstName = ILike(`%${query.search}%`);
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

    async findById(tenantId: string, id: string): Promise<TutorEntity> {
        const tutor = await this.repo.findOne({ where: { id, tenantId } });
        if (!tutor) {
            throw new NotFoundException('Tutor not found');
        }
        return tutor;
    }

    async create(tenantId: string, userId: string, data: Partial<TutorEntity>): Promise<TutorEntity> {
        const tutor = this.repo.create({
            ...data,
            tenantId,
            createdBy: userId,
        });
        return this.repo.save(tutor);
    }

    async update(tenantId: string, id: string, data: Partial<TutorEntity>): Promise<TutorEntity> {
        const tutor = await this.findById(tenantId, id);
        Object.assign(tutor, data);
        return this.repo.save(tutor);
    }

    async remove(tenantId: string, id: string): Promise<void> {
        const tutor = await this.findById(tenantId, id);
        await this.repo.softRemove(tutor);
    }
}
