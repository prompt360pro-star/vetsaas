import { api } from '@/lib/api-client';
import type { AuditLogDto, PaginatedResponse } from '@vetsaas/shared';

export interface AuditFilters {
    page?: number;
    limit?: number;
    entityType?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
}

export const auditApi = {
    /**
     * Fetch paginated audit logs with optional filters.
     */
    async fetchLogs(filters: AuditFilters = {}): Promise<PaginatedResponse<AuditLogDto>> {
        const params: Record<string, string> = {};
        if (filters.page) params.page = String(filters.page);
        if (filters.limit) params.limit = String(filters.limit);
        if (filters.entityType) params.entityType = filters.entityType;
        if (filters.action) params.action = filters.action;
        if (filters.userId) params.userId = filters.userId;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        return api.get<PaginatedResponse<AuditLogDto>>('/audit', params);
    },

    /**
     * Fetch audit history for a specific entity.
     */
    async fetchEntityHistory(entityType: string, entityId: string): Promise<AuditLogDto[]> {
        return api.get<AuditLogDto[]>(`/audit/${entityType}/${entityId}`);
    },
};
