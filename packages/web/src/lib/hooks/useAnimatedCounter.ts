'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hook that animates a number from 0 to target with spring-like easing.
 * Returns the current animated value as a formatted string.
 */
export function useAnimatedCounter(
    target: number,
    options?: {
        /** Animation duration in ms (default: 1200) */
        duration?: number;
        /** Decimal places (default: 0) */
        decimals?: number;
        /** Format function override */
        formatter?: (value: number) => string;
        /** Delay before starting in ms (default: 0) */
        delay?: number;
    },
): string {
    const {
        duration = 1200,
        decimals = 0,
        formatter,
        delay = 0,
    } = options ?? {};

    const [display, setDisplay] = useState('0');
    const rafRef = useRef<number>();
    const startRef = useRef<number>();
    const prevTarget = useRef(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const from = prevTarget.current;
            prevTarget.current = target;

            const animate = (ts: number) => {
                if (!startRef.current) startRef.current = ts;
                const elapsed = ts - startRef.current;
                const progress = Math.min(elapsed / duration, 1);

                // Ease-out cubic for smooth deceleration
                const eased = 1 - Math.pow(1 - progress, 3);

                const current = from + (target - from) * eased;

                if (formatter) {
                    setDisplay(formatter(current));
                } else {
                    setDisplay(
                        current.toLocaleString('pt-AO', {
                            minimumFractionDigits: decimals,
                            maximumFractionDigits: decimals,
                        }),
                    );
                }

                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(animate);
                }
            };

            startRef.current = undefined;
            rafRef.current = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timeout);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration, decimals, formatter, delay]);

    return display;
}
