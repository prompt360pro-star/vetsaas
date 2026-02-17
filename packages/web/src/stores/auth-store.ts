'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api-client';
import type { AuthTokens, UserProfile } from '@vetsaas/shared';

interface AuthState {
    user: UserProfile | null;
    tokens: AuthTokens | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        clinicName: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) => Promise<void>;
    logout: () => void;
    loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            tokens: null,
            isLoading: false,
            isAuthenticated: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const res = await api.post<{ data: AuthTokens }>('/auth/login', {
                        email,
                        password,
                    });
                    const tokens = res.data;
                    api.setToken(tokens.accessToken);
                    set({ tokens, isAuthenticated: true });

                    // Load profile
                    await get().loadProfile();
                } finally {
                    set({ isLoading: false });
                }
            },

            register: async (data) => {
                set({ isLoading: true });
                try {
                    const res = await api.post<{ data: AuthTokens }>('/auth/register', data);
                    const tokens = res.data;
                    api.setToken(tokens.accessToken);
                    set({ tokens, isAuthenticated: true });

                    await get().loadProfile();
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: () => {
                api.setToken(null);
                set({ user: null, tokens: null, isAuthenticated: false });
            },

            loadProfile: async () => {
                try {
                    const res = await api.get<{ data: UserProfile }>('/auth/profile');
                    set({ user: res.data });
                } catch {
                    get().logout();
                }
            },
        }),
        {
            name: 'vetsaas-auth',
            partialize: (state) => ({
                tokens: state.tokens,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);
