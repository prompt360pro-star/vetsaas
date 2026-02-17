import { api } from '@/lib/api-client';
import type { ClinicalTemplateDto } from '@vetsaas/shared';

export const templatesApi = {
    /**
     * Fetch all available SOAP templates.
     */
    async fetchAll(): Promise<ClinicalTemplateDto[]> {
        const res = await api.get<ClinicalTemplateDto[]>('/records/templates');
        return res;
    },

    /**
     * Fetch a single SOAP template by ID.
     */
    async fetchById(id: string): Promise<ClinicalTemplateDto> {
        const res = await api.get<ClinicalTemplateDto>(`/records/templates/${id}`);
        return res;
    },
};
