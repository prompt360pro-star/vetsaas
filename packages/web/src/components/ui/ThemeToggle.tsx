'use client';

import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/hooks/useTheme';

export function ThemeToggle() {
    const { isDark, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl
                       bg-surface-100 dark:bg-surface-800
                       hover:bg-surface-200 dark:hover:bg-surface-700
                       transition-colors duration-200"
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.span
                        key="moon"
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Moon className="w-4 h-4 text-indigo-400" />
                    </motion.span>
                ) : (
                    <motion.span
                        key="sun"
                        initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sun className="w-4 h-4 text-amber-500" />
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
