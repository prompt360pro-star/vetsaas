'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiResult<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Generic data fetching hook with loading/error states.
 *
 * @param fetcher — async function returning the data
 * @param deps — optional dependency array (refetches when deps change)
 */
export function useApi<T>(
    fetcher: () => Promise<T>,
    deps: unknown[] = [],
): UseApiResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetcher();
            if (mountedRef.current) {
                setData(result);
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
            }
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        mountedRef.current = true;
        fetchData();
        return () => {
            mountedRef.current = false;
        };
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}
