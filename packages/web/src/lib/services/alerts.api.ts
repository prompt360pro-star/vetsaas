import { api } from '@/lib/api-client';
import type { ClinicalAlertDto } from '@vetsaas/shared';

export const alertsApi = {
    /**
     * Fetch all active clinical alerts for the tenant.
     */
    async fetchAlerts(): Promise<ClinicalAlertDto[]> {
        const res = await api.get<{ data: ClinicalAlertDto[] }>('/alerts');
        return res.data;
    },
};
