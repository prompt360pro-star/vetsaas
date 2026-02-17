import { useEffect } from 'react';

type ModifierKey = 'ctrl' | 'shift' | 'alt' | 'meta';

interface HotkeyOptions {
    modifiers?: ModifierKey[];
    preventDefault?: boolean;
}

/**
 * Register a keyboard shortcut.
 *
 * @example useHotkey('k', focusSearch, { modifiers: ['ctrl'] });
 */
export function useHotkey(
    key: string,
    callback: (e: KeyboardEvent) => void,
    options: HotkeyOptions = {},
) {
    const { modifiers = [], preventDefault = true } = options;

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() !== key.toLowerCase()) return;

            // Check modifiers
            if (modifiers.includes('ctrl') && !(e.ctrlKey || e.metaKey)) return;
            if (modifiers.includes('shift') && !e.shiftKey) return;
            if (modifiers.includes('alt') && !e.altKey) return;
            if (modifiers.includes('meta') && !e.metaKey) return;

            // Don't fire inside inputs/textareas unless modifier is held
            const tag = (e.target as HTMLElement).tagName;
            if (modifiers.length === 0 && (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')) {
                return;
            }

            if (preventDefault) e.preventDefault();
            callback(e);
        };

        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [key, callback, modifiers, preventDefault]);
}
