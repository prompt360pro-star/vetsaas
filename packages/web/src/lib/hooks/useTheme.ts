'use client';

import { useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function applyTheme(theme: Theme) {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>('system');

    // Initialize from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('vetsaas-theme') as Theme | null;
        const initial = stored || 'system';
        setThemeState(initial);
        applyTheme(initial);

        // Listen for system preference changes
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if ((localStorage.getItem('vetsaas-theme') || 'system') === 'system') {
                applyTheme('system');
            }
        };
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        localStorage.setItem('vetsaas-theme', t);
        applyTheme(t);
    }, []);

    const toggle = useCallback(() => {
        const current = document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    }, [setTheme]);

    const isDark =
        theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');

    return { theme, setTheme, toggle, isDark };
}
