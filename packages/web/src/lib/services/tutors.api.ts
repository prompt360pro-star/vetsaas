import { api } from '@/lib/api-client';
import type { CreateTutorDto, TutorDto, PaginatedResponse, PaginationQuery } from '@vetsaas/shared';

export const tutorsApi = {
    /**
     * Get all tutors with pagination and filtering.
     */
    async getAll(query: PaginationQuery = {}): Promise<PaginatedResponse<TutorDto>> {
        const params: Record<string, string> = {};

        if (query.page) params.page = query.page.toString();
        if (query.limit) params.limit = query.limit.toString();
        if (query.sortBy) params.sortBy = query.sortBy;
        if (query.sortOrder) params.sortOrder = query.sortOrder;
        if (query.search) params.search = query.search;

        const res = await api.get<{ success: boolean; data: PaginatedResponse<TutorDto> }>('/tutors', params);
        return res.data;
    },

    /**
     * Create a new tutor.
     */
    async create(data: CreateTutorDto): Promise<TutorDto> {
        const res = await api.post<{ success: boolean; data: TutorDto }>('/tutors', data);
        return res.data;
    },
};
