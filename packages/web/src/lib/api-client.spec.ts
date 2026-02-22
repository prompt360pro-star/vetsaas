// ============================================================================
// API Client — Unit Tests
// ============================================================================

import { api, ApiError } from './api-client';

describe('ApiClient', () => {
    let fetchMock: jest.Mock;

    beforeEach(() => {
        // Mock global fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true }),
            } as Response)
        );
        fetchMock = global.fetch as jest.Mock;

        // Reset token before each test
        api.setToken(null);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should perform GET request with correct headers', async () => {
        await api.get('/users');

        expect(fetchMock).toHaveBeenCalledWith('/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    });

    it('should perform GET request with query parameters', async () => {
        await api.get('/users', { page: '1', limit: '10' });

        expect(fetchMock).toHaveBeenCalledWith('/api/users?page=1&limit=10', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    });

    it('should perform POST request with body', async () => {
        const data = { name: 'John Doe' };
        await api.post('/users', data);

        expect(fetchMock).toHaveBeenCalledWith('/api/users', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    });

    it('should perform PUT request with body', async () => {
        const data = { name: 'John Doe Updated' };
        await api.put('/users/1', data);

        expect(fetchMock).toHaveBeenCalledWith('/api/users/1', {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    });

    it('should perform PATCH request with body', async () => {
        const data = { name: 'John' };
        await api.patch('/users/1', data);

        expect(fetchMock).toHaveBeenCalledWith('/api/users/1', {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    });

    it('should perform DELETE request', async () => {
        await api.delete('/users/1');

        expect(fetchMock).toHaveBeenCalledWith('/api/users/1', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    });

    it('should include authorization header when token is set', async () => {
        const token = 'mock-token';
        api.setToken(token);

        await api.get('/protected');

        expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        }));
    });

    it('should throw ApiError on non-ok response', async () => {
        const errorMessage = 'Validation failed';
        const errors = { email: ['Invalid email'] };

        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ message: errorMessage, errors }),
            } as Response)
        );

        await expect(api.post('/users', {})).rejects.toThrow(ApiError);

        try {
            await api.post('/users', {});
        } catch (error) {
            if (error instanceof ApiError) {
                expect(error.status).toBe(400);
                expect(error.message).toBe(errorMessage);
                expect(error.errors).toEqual(errors);
            }
        }
    });

    it('should handle empty error response', async () => {
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                json: () => Promise.reject('JSON parse error'), // Simulate empty or invalid JSON
            } as Response)
        );

        await expect(api.get('/error')).rejects.toThrow('Request failed');
    });
});
