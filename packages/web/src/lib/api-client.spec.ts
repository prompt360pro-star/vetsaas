
import { api, ApiClient } from './api-client';

describe('ApiClient', () => {
    beforeEach(() => {
        // Reset singleton state
        api.setToken(null);
    });

    it('should share state on singleton', () => {
        api.setToken('token1');
        // Access private property for testing purposes using 'any'
        expect((api as any).accessToken).toBe('token1');

        const apiReference = api;
        expect((apiReference as any).accessToken).toBe('token1');

        api.setToken('token2');
        expect((apiReference as any).accessToken).toBe('token2');
    });

    it('should verify isolation with new instances', () => {
        const client1 = new ApiClient();
        const client2 = new ApiClient();

        client1.setToken('token1');
        expect((client1 as any).accessToken).toBe('token1');
        // Ideally, a new client should start with null token
        expect((client2 as any).accessToken).toBeNull();

        client2.setToken('token2');
        expect((client1 as any).accessToken).toBe('token1');
        expect((client2 as any).accessToken).toBe('token2');
    });

    it('should support withToken for immutable-like creation', () => {
        const baseClient = new ApiClient();
        const tokenClient = baseClient.withToken('token-abc');

        expect((baseClient as any).accessToken).toBeNull();
        expect((tokenClient as any).accessToken).toBe('token-abc');
        expect(tokenClient).not.toBe(baseClient);
        expect(tokenClient instanceof ApiClient).toBe(true);
    });
});
