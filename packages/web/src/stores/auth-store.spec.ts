// ============================================================================
// Auth Store — Unit Tests (Zustand)
// ============================================================================

import { useAuthStore } from './auth-store';

// Reset store between tests
beforeEach(() => {
    useAuthStore.setState({
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
    });
});

describe('useAuthStore', () => {
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
    });

    it('should have login method', () => {
        expect(typeof useAuthStore.getState().login).toBe('function');
    });

    it('should have register method', () => {
        expect(typeof useAuthStore.getState().register).toBe('function');
    });

    it('should have loadProfile method', () => {
        expect(typeof useAuthStore.getState().loadProfile).toBe('function');
    });
});
