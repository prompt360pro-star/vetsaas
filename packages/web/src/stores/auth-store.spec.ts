// ============================================================================
// Auth Store — Unit Tests (Zustand)
// ============================================================================

import { useAuthStore } from './auth-store';
import { api } from '@/lib/api-client';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn(),
        setToken: jest.fn(),
    },
}));

describe('useAuthStore', () => {
    // Reset store and mocks between tests
    beforeEach(() => {
        useAuthStore.setState({
            user: null,
            tokens: null,
            isLoading: false,
            isAuthenticated: false,
        });
        jest.clearAllMocks();
    });

    it('should start with unauthenticated state', () => {
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.tokens).toBeNull();
        expect(state.isLoading).toBe(false);
    });

    it('should clear state on logout', () => {
        // Manually set authenticated state
        useAuthStore.setState({
            user: {
                id: 'user-1',
                tenantId: 'tenant-1',
                email: 'vet@clinica.ao',
                firstName: 'António',
                lastName: 'Silva',
                role: 'VETERINARIAN',
                mfaEnabled: false,
            },
            tokens: {
                accessToken: 'mock-access',
                refreshToken: 'mock-refresh',
                expiresIn: 900,
            },
            isAuthenticated: true,
        });

        expect(useAuthStore.getState().isAuthenticated).toBe(true);

        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.tokens).toBeNull();
        expect(api.setToken).toHaveBeenCalledWith(null);
    });

    describe('login', () => {
        const mockTokens = {
            accessToken: 'access-token-123',
            refreshToken: 'refresh-token-123',
            expiresIn: 3600,
        };

        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'VETERINARIAN',
        };

        it('should handle successful login', async () => {
            // Setup mocks
            (api.post as jest.Mock).mockResolvedValue({ data: mockTokens });
            (api.get as jest.Mock).mockResolvedValue({ data: mockUser });

            // Execute login
            const loginPromise = useAuthStore.getState().login('test@example.com', 'password123');

            // Check loading state while promise is pending would be tricky with async/await
            // but we can check after it resolves

            await loginPromise;

            const state = useAuthStore.getState();

            // Verify API calls
            expect(api.post).toHaveBeenCalledWith('/auth/login', {
                email: 'test@example.com',
                password: 'password123',
            });
            expect(api.setToken).toHaveBeenCalledWith(mockTokens.accessToken);
            expect(api.get).toHaveBeenCalledWith('/auth/profile');

            // Verify state updates
            expect(state.tokens).toEqual(mockTokens);
            expect(state.user).toEqual(mockUser);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isLoading).toBe(false);
        });

        it('should handle login failure', async () => {
            const error = new Error('Login failed');
            (api.post as jest.Mock).mockRejectedValue(error);

            const store = useAuthStore.getState();

            await expect(store.login('test@example.com', 'wrong-password')).rejects.toThrow('Login failed');

            const state = useAuthStore.getState();
            expect(state.isLoading).toBe(false);
            expect(state.isAuthenticated).toBe(false);
            expect(state.tokens).toBeNull();
        });
    });

    describe('register', () => {
        const mockTokens = {
            accessToken: 'access-token-456',
            refreshToken: 'refresh-token-456',
            expiresIn: 3600,
        };

        const mockUser = {
            id: 'user-456',
            email: 'new@example.com',
            firstName: 'New',
            lastName: 'User',
            role: 'VETERINARIAN',
        };

        const registerData = {
            clinicName: 'New Clinic',
            email: 'new@example.com',
            password: 'password123',
            firstName: 'New',
            lastName: 'User',
        };

        it('should handle successful registration', async () => {
            (api.post as jest.Mock).mockResolvedValue({ data: mockTokens });
            (api.get as jest.Mock).mockResolvedValue({ data: mockUser });

            await useAuthStore.getState().register(registerData);

            const state = useAuthStore.getState();

            expect(api.post).toHaveBeenCalledWith('/auth/register', registerData);
            expect(api.setToken).toHaveBeenCalledWith(mockTokens.accessToken);
            expect(api.get).toHaveBeenCalledWith('/auth/profile');

            expect(state.tokens).toEqual(mockTokens);
            expect(state.user).toEqual(mockUser);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isLoading).toBe(false);
        });

        it('should handle registration failure', async () => {
            const error = new Error('Registration failed');
            (api.post as jest.Mock).mockRejectedValue(error);

            await expect(useAuthStore.getState().register(registerData)).rejects.toThrow('Registration failed');

            const state = useAuthStore.getState();
            expect(state.isLoading).toBe(false);
            expect(state.isAuthenticated).toBe(false);
            expect(state.tokens).toBeNull();
        });
    });

    describe('loadProfile', () => {
        it('should update user on successful profile load', async () => {
            const mockUser = {
                id: 'user-789',
                email: 'profile@example.com',
            };
            (api.get as jest.Mock).mockResolvedValue({ data: mockUser });

            await useAuthStore.getState().loadProfile();

            const state = useAuthStore.getState();
            expect(state.user).toEqual(mockUser);
            expect(api.get).toHaveBeenCalledWith('/auth/profile');
        });

        it('should logout on profile load failure', async () => {
            (api.get as jest.Mock).mockRejectedValue(new Error('Profile fetch failed'));

            // Set initial authenticated state
            useAuthStore.setState({
                isAuthenticated: true,
                tokens: { accessToken: 'token' } as any,
            });

            await useAuthStore.getState().loadProfile();

            const state = useAuthStore.getState();
            expect(state.isAuthenticated).toBe(false);
            expect(state.tokens).toBeNull();
            expect(state.user).toBeNull();
            expect(api.setToken).toHaveBeenCalledWith(null);
        });
    });
});
