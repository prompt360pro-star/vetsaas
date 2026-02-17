import { api } from '@/lib/api-client';

const BASE = '/export';

function downloadBlob(data: string, filename: string) {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export const exportApi = {
    async downloadAnimals() {
        const csv = await api.get<string>(`${BASE}/animals`);
        const date = new Date().toISOString().split('T')[0];
        downloadBlob(csv, `pacientes_${date}.csv`);
    },

    async downloadPayments(startDate?: string, endDate?: string) {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const csv = await api.get<string>(`${BASE}/payments`, params);
        const date = new Date().toISOString().split('T')[0];
        downloadBlob(csv, `pagamentos_${date}.csv`);
    },

    async downloadAudit(limit?: number) {
        const params: Record<string, string> = {};
        if (limit) params.limit = String(limit);
        const csv = await api.get<string>(`${BASE}/audit`, params);
        const date = new Date().toISOString().split('T')[0];
        downloadBlob(csv, `auditoria_${date}.csv`);
    },
};
