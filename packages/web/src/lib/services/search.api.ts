import { api } from '@/lib/api-client';
import { SearchResult, SearchResponse } from '@vetsaas/shared';

export const searchApi = {
    async globalSearch(query: string): Promise<SearchResponse> {
        const res = await api.get<{ data: SearchResponse }>('/search', { q: query });
        return res.data;
    },
};
