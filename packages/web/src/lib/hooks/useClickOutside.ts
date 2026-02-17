'use client';

import { useEffect, useRef } from 'react';

/**
 * Fires a callback when a click occurs outside the referenced element.
 * Returns a ref to attach to the container element.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    onClickOutside: () => void,
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClickOutside();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClickOutside]);

    return ref;
}
