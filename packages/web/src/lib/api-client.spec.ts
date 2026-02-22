import { api, ApiClient } from './api-client';

describe('ApiClient', () => {
    beforeEach(() => {
        api.setToken(null);
    });

    it('should allow setting token on singleton', () => {
        api.setToken('token1');
        expect((api as any).accessToken).toBe('token1');
    });

    it('should create independent instances via constructor', () => {
        const client1 = new ApiClient({ accessToken: 'token1' });
        const client2 = new ApiClient({ accessToken: 'token2' });

        expect((client1 as any).accessToken).toBe('token1');
        expect((client2 as any).accessToken).toBe('token2');

        // Ensure singleton is unaffected
        expect((api as any).accessToken).toBeNull();
    });

    it('should create new instance with withToken', () => {
        const client = new ApiClient();
        const newClient = client.withToken('token-x');

        expect((newClient as any).accessToken).toBe('token-x');
        expect((client as any).accessToken).toBeNull();
    });
});
