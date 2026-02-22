// ============================================================================
// API Client — HTTP utility for frontend ↔ backend communication
// ============================================================================

const API_BASE = '/api';

interface ApiClientConfig {
    baseUrl?: string;
    accessToken?: string | null;
}

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

export class ApiClient {
    private accessToken: string | null = null;
    private baseUrl: string;

    constructor(config?: ApiClientConfig) {
        this.baseUrl = config?.baseUrl ?? API_BASE;
        this.accessToken = config?.accessToken ?? null;
    }

    /**
     * Set the access token for this client instance.
     * @deprecated Use `withToken` for server-side requests to avoid shared state.
     */
    setToken(token: string | null) {
        this.accessToken = token;
    }

    /**
     * Create a new ApiClient instance with the specified token.
     * Useful for SSR to avoid shared state.
     */
    withToken(token: string): ApiClient {
        return new ApiClient({
            baseUrl: this.baseUrl,
            accessToken: token,
        });
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {},
    ): Promise<T> {
        const { params, ...fetchOptions } = options;

        let url = `${this.baseUrl}${endpoint}`;
        if (params) {
            const searchParams = new URLSearchParams(params);
            url += `?${searchParams.toString()}`;
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                error.message || 'Request failed',
                error.errors,
            );
        }

        return response.json();
    }

    async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', params });
    }

    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public errors?: Record<string, string[]>,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Global API client instance.
 * Warning: This is a singleton. Avoid using `setToken` in SSR contexts.
 * For server-side requests, create a new instance using `new ApiClient()` or `api.withToken()`.
 */
export const api = new ApiClient();
