'use client';

import { useState, useEffect } from 'react';

/**
 * Debounce a value by the specified delay in milliseconds.
 * Useful for search inputs that trigger API calls.
 */
export function useDebounce<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
