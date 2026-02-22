// ============================================================================
// Search Service — Cross-entity search (Animals, Tutors, Records)
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnimalEntity } from '../animals/animal.entity';
import { TutorEntity } from '../tutors/tutor.entity';
import { ClinicalRecordEntity } from '../records/clinical-record.entity';

export interface SearchResult {
    type: 'animal' | 'tutor' | 'record';
    id: string;
    title: string;
    subtitle: string;
    icon: string;
}

export interface SearchResponse {
    query: string;
    total: number;
    results: SearchResult[];
}

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(AnimalEntity)
        private readonly animalsRepo: Repository<AnimalEntity>,
        @InjectRepository(TutorEntity)
        private readonly tutorsRepo: Repository<TutorEntity>,
        @InjectRepository(ClinicalRecordEntity)
        private readonly recordsRepo: Repository<ClinicalRecordEntity>,
    ) {}

    async search(
        tenantId: string,
        query: string,
        limit: number = 20,
    ): Promise<SearchResponse> {
        if (!query || query.trim().length < 2) {
            return { query, total: 0, results: [] };
        }

        const q = `%${query.trim().toLowerCase()}%`;
        const perEntity = Math.ceil(limit / 3);

        const [animals, tutors, records] = await Promise.all([
            this.searchAnimals(tenantId, q, perEntity),
            this.searchTutors(tenantId, q, perEntity),
            this.searchRecords(tenantId, q, perEntity),
        ]);

        const results = [...animals, ...tutors, ...records];
        return { query, total: results.length, results };
    }

    private async searchAnimals(
        tenantId: string,
        q: string,
        limit: number,
    ): Promise<SearchResult[]> {
        const animals = await this.animalsRepo
            .createQueryBuilder('a')
            .where('a.tenantId = :tenantId', { tenantId })
            .andWhere(
                '(LOWER(a.name) LIKE :q OR LOWER(a.species) LIKE :q OR LOWER(a.breed) LIKE :q OR a.microchipId LIKE :q)',
                { q },
            )
            .orderBy('a.name', 'ASC')
            .take(limit)
            .getMany();

        return animals.map((a) => ({
            type: 'animal' as const,
            id: a.id,
            title: a.name,
            subtitle: `${a.species}${a.breed ? ' · ' + a.breed : ''}`,
            icon: '🐾',
        }));
    }

    private async searchTutors(
        tenantId: string,
        q: string,
        limit: number,
    ): Promise<SearchResult[]> {
        const tutors = await this.tutorsRepo
            .createQueryBuilder('t')
            .where('t.tenantId = :tenantId', { tenantId })
            .andWhere(
                '(LOWER(t.firstName) LIKE :q OR LOWER(t.lastName) LIKE :q OR LOWER(t.email) LIKE :q OR t.phone LIKE :q)',
                { q },
            )
            .orderBy('t.firstName', 'ASC')
            .take(limit)
            .getMany();

        return tutors.map((t) => ({
            type: 'tutor' as const,
            id: t.id,
            title: `${t.firstName} ${t.lastName}`,
            subtitle: t.phone,
            icon: '👤',
        }));
    }

    private async searchRecords(
        tenantId: string,
        q: string,
        limit: number,
    ): Promise<SearchResult[]> {
        const records = await this.recordsRepo
            .createQueryBuilder('r')
            .where('r.tenantId = :tenantId', { tenantId })
            .andWhere(
                '(LOWER(r.subjective) LIKE :q OR LOWER(r.assessment) LIKE :q OR LOWER(r.plan) LIKE :q)',
                { q },
            )
            .orderBy('r.createdAt', 'DESC')
            .take(limit)
            .getMany();

        return records.map((r) => ({
            type: 'record' as const,
            id: r.id,
            title: r.assessment ? r.assessment.substring(0, 60) : 'Prontuário',
            subtitle: `Criado ${new Date(r.createdAt).toLocaleDateString('pt-AO')}`,
            icon: '📋',
        }));
    }
}
