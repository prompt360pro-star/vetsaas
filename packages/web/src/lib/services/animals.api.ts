import { api } from '@/lib/api-client';
import type { CreateAnimalDto, PaginationQuery, PaginatedResponse } from '@vetsaas/shared';

export interface Animal {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    sex: string;
    weight: number | null;
    weightUnit: string;
    microchipId: string | null;
    isNeutered: boolean;
    dateOfBirth: string | null;
    photoUrl: string | null;
    isDeceased: boolean;
    tutorIds: string[];
}

export const animalsApi = {
    getAll: (params?: PaginationQuery) => {
        const queryParams: Record<string, string> = {};
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams[key] = String(value);
                }
            });
        }
        return api.get<{ success: boolean; data: PaginatedResponse<Animal> }>('/animals', queryParams);
    },
    create: (data: CreateAnimalDto) => api.post<{ success: boolean; data: Animal }>('/animals', data),
};
