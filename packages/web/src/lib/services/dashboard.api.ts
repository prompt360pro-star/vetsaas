import { api } from '@/lib/api-client';
import type { DashboardStatsDto, AuditLogDto } from '@vetsaas/shared';

export const dashboardApi = {
    /**
     * Fetch real-time dashboard KPIs.
     */
    async fetchStats(): Promise<DashboardStatsDto> {
        const res = await api.get<{ data: DashboardStatsDto }>('/dashboard/stats');
        return res.data;
    },

    /**
     * Fetch recent activity feed (audit log entries).
     */
    async fetchActivity(): Promise<AuditLogDto[]> {
        const res = await api.get<{ data: AuditLogDto[] }>('/dashboard/activity');
        return res.data;
    },
};
