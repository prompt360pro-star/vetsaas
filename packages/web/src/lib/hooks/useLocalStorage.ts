'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Typed, SSR-safe localStorage hook with JSON serialization.
 * Falls back to initialValue when localStorage is unavailable.
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // Lazy init — only read localStorage once
    const [stored, setStored] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    // Persist on change
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(key, JSON.stringify(stored));
        } catch {
            // quota exceeded or private browsing
        }
    }, [key, stored]);

    // Listen for cross-tab changes
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStored(JSON.parse(e.newValue) as T);
                } catch {
                    // ignore bad JSON
                }
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, [key]);

    const remove = useCallback(() => {
        setStored(initialValue);
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
        }
    }, [key, initialValue]);

    return [stored, setStored, remove];
}
