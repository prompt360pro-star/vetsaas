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

const mockedApi = api as jest.Mocked<typeof api>;

describe('useAuthStore', () => {
    const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
    };

    const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'VETERINARIAN',
        tenantId: 'tenant-1',
        mfaEnabled: false,
    };

    beforeEach(() => {
        // Reset store state
        useAuthStore.setState({
            user: null,
            tokens: null,
            isLoading: false,
            isAuthenticated: false,
        });

        // Reset mocks
        jest.clearAllMocks();
    });

    it('should start with unauthenticated state', () => {
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.tokens).toBeNull();
        expect(state.isLoading).toBe(false);
    });

    describe('login', () => {
        it('should handle successful login', async () => {
            // Setup mocks
            mockedApi.post.mockResolvedValueOnce({ data: mockTokens });
            mockedApi.get.mockResolvedValueOnce({ data: mockUser });

            // Execute login
            await useAuthStore.getState().login('test@example.com', 'password123');

            // Verify API calls
            expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
                email: 'test@example.com',
                password: 'password123',
            });
            expect(mockedApi.setToken).toHaveBeenCalledWith(mockTokens.accessToken);
            expect(mockedApi.get).toHaveBeenCalledWith('/auth/profile');

            // Verify state updates
            const state = useAuthStore.getState();
            expect(state.isAuthenticated).toBe(true);
            expect(state.tokens).toEqual(mockTokens);
            expect(state.user).toEqual(mockUser);
            expect(state.isLoading).toBe(false);
        });

        it('should handle login failure', async () => {
            const error = new Error('Invalid credentials');
            mockedApi.post.mockRejectedValueOnce(error);

            // Execute and expect error
            await expect(
                useAuthStore.getState().login('test@example.com', 'wrong')
            ).rejects.toThrow('Invalid credentials');

            // Verify state
            const state = useAuthStore.getState();
            expect(state.isAuthenticated).toBe(false);
            expect(state.tokens).toBeNull();
            expect(state.user).toBeNull();
            expect(state.isLoading).toBe(false);

            // Verify profile load was NOT called
            expect(mockedApi.get).not.toHaveBeenCalled();
        });
    });

    describe('register', () => {
        const registerData = {
            clinicName: 'Test Clinic',
            email: 'new@example.com',
            password: 'password123',
            firstName: 'New',
            lastName: 'Vet',
        };

        it('should handle successful registration', async () => {
            mockedApi.post.mockResolvedValueOnce({ data: mockTokens });
            mockedApi.get.mockResolvedValueOnce({ data: mockUser });

            await useAuthStore.getState().register(registerData);

            expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', registerData);
            expect(mockedApi.setToken).toHaveBeenCalledWith(mockTokens.accessToken);
            expect(mockedApi.get).toHaveBeenCalledWith('/auth/profile');

            const state = useAuthStore.getState();
            expect(state.isAuthenticated).toBe(true);
            expect(state.tokens).toEqual(mockTokens);
            expect(state.user).toEqual(mockUser);
            expect(state.isLoading).toBe(false);
        });

        it('should handle registration failure', async () => {
            const error = new Error('Registration failed');
            mockedApi.post.mockRejectedValueOnce(error);

            await expect(
                useAuthStore.getState().register(registerData)
            ).rejects.toThrow('Registration failed');

            const state = useAuthStore.getState();
            expect(state.isAuthenticated).toBe(false);
            expect(state.isLoading).toBe(false);
        });
    });

    describe('loadProfile', () => {
        it('should handle successful profile load', async () => {
            mockedApi.get.mockResolvedValueOnce({ data: mockUser });

            await useAuthStore.getState().loadProfile();

            expect(mockedApi.get).toHaveBeenCalledWith('/auth/profile');
            expect(useAuthStore.getState().user).toEqual(mockUser);
        });

        it('should logout on profile load failure', async () => {
            mockedApi.get.mockRejectedValueOnce(new Error('Unauthorized'));

            // Setup initial state to verify it gets cleared
            useAuthStore.setState({ isAuthenticated: true, tokens: mockTokens });

            await useAuthStore.getState().loadProfile();

            expect(mockedApi.setToken).toHaveBeenCalledWith(null);

            const state = useAuthStore.getState();
            expect(state.isAuthenticated).toBe(false);
            expect(state.tokens).toBeNull();
            expect(state.user).toBeNull();
        });
    });

    describe('logout', () => {
        it('should clear state on logout', () => {
            useAuthStore.setState({
                user: mockUser as any,
                tokens: mockTokens,
                isAuthenticated: true,
            });

            useAuthStore.getState().logout();

            expect(mockedApi.setToken).toHaveBeenCalledWith(null);

            const state = useAuthStore.getState();
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.tokens).toBeNull();
        });
    });
});
