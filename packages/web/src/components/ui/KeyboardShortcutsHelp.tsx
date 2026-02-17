'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/* ── Shortcut Groups ─────────────────────────────── */

interface ShortcutItem {
    keys: string[];
    description: string;
}

interface ShortcutGroup {
    title: string;
    shortcuts: ShortcutItem[];
}

const shortcutGroups: ShortcutGroup[] = [
    {
        title: 'Geral',
        shortcuts: [
            { keys: ['Ctrl', 'K'], description: 'Abrir paleta de comandos' },
            { keys: ['?'], description: 'Mostrar atalhos de teclado' },
            { keys: ['Esc'], description: 'Fechar modal / painel' },
        ],
    },
    {
        title: 'Navegação',
        shortcuts: [
            { keys: ['G', 'D'], description: 'Ir para Dashboard' },
            { keys: ['G', 'A'], description: 'Ir para Animais' },
            { keys: ['G', 'T'], description: 'Ir para Tutores' },
            { keys: ['G', 'C'], description: 'Ir para Consultas' },
            { keys: ['G', 'P'], description: 'Ir para Pagamentos' },
            { keys: ['G', 'I'], description: 'Ir para Inventário' },
        ],
    },
    {
        title: 'Acções',
        shortcuts: [
            { keys: ['N'], description: 'Novo registo (na página actual)' },
            { keys: ['S'], description: 'Guardar formulário' },
            { keys: ['/'], description: 'Focar na pesquisa' },
        ],
    },
];

/* ── Key Badge ───────────────────────────────────── */

function KeyBadge({ children }: { children: string }) {
    return (
        <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono font-semibold text-surface-600 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-md shadow-sm">
            {children}
        </kbd>
    );
}

/* ── Component ───────────────────────────────────── */

export function KeyboardShortcutsHelp() {
    const [open, setOpen] = useState(false);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignore if typing in an input
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setOpen(true);
        }
        if (e.key === 'Escape' && open) {
            setOpen(false);
        }
    }, [open]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[61] rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800">
                            <h2 className="text-base font-semibold text-surface-900 dark:text-surface-50">
                                Atalhos de Teclado
                            </h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                                aria-label="Fechar"
                            >
                                <X className="w-4 h-4 text-surface-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-5">
                            {shortcutGroups.map((group) => (
                                <div key={group.title}>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-surface-400 mb-2">
                                        {group.title}
                                    </h3>
                                    <div className="space-y-1.5">
                                        {group.shortcuts.map((s) => (
                                            <div
                                                key={s.description}
                                                className="flex items-center justify-between py-1.5"
                                            >
                                                <span className="text-sm text-surface-600 dark:text-surface-400">
                                                    {s.description}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {s.keys.map((k, i) => (
                                                        <span key={i} className="flex items-center gap-1">
                                                            {i > 0 && (
                                                                <span className="text-[10px] text-surface-400">+</span>
                                                            )}
                                                            <KeyBadge>{k}</KeyBadge>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-100 dark:border-surface-800 text-center">
                            <p className="text-[11px] text-surface-400">
                                Carregue <KeyBadge>?</KeyBadge> a qualquer momento para ver esta ajuda
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
