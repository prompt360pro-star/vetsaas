import { api } from '@/lib/api-client';

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

export const searchApi = {
    async globalSearch(query: string): Promise<SearchResponse> {
        const res = await api.get<{ data: SearchResponse }>('/search', { q: query });
        return res.data;
    },
};
