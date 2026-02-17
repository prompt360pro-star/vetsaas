'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Dog, User, FileText } from 'lucide-react';
import { searchApi } from '@/lib/services';
import type { SearchResult } from '@/lib/services';

const typeIcons = {
    animal: Dog,
    tutor: User,
    record: FileText,
};

const typeLabels = {
    animal: 'Paciente',
    tutor: 'Tutor',
    record: 'Prontuário',
};

export function SearchBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // CMD+K handler
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    const doSearch = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await searchApi.globalSearch(q);
            setResults(res.results);
        } catch {
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(value), 300);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-surface-400 bg-surface-100 dark:bg-surface-800 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors w-full max-w-xs"
            >
                <Search className="w-4 h-4" />
                <span className="flex-1 text-left">Pesquisar...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-surface-200 dark:bg-surface-700 rounded">
                    ⌘K
                </kbd>
            </button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Search Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.97 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-lg mx-4 glass-card overflow-hidden shadow-2xl"
                        >
                            {/* Input */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                                <Search className="w-5 h-5 text-surface-400" />
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => handleChange(e.target.value)}
                                    placeholder="Pesquisar pacientes, tutores, prontuários…"
                                    className="flex-1 bg-transparent text-surface-900 dark:text-surface-50 placeholder:text-surface-400 text-sm outline-none"
                                />
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 text-surface-400 animate-spin" />
                                ) : query ? (
                                    <button onClick={() => handleChange('')} aria-label="Limpar pesquisa">
                                        <X className="w-4 h-4 text-surface-400 hover:text-surface-600" />
                                    </button>
                                ) : null}
                            </div>

                            {/* Results */}
                            <div className="max-h-80 overflow-y-auto">
                                {results.length > 0 ? (
                                    <div className="py-2">
                                        {results.map((r) => {
                                            const Icon = typeIcons[r.type] || FileText;
                                            return (
                                                <button
                                                    key={`${r.type}-${r.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
                                                        <Icon className="w-4 h-4 text-surface-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-surface-900 dark:text-surface-50 truncate">
                                                            {r.title}
                                                        </p>
                                                        <p className="text-xs text-surface-400 truncate">
                                                            {typeLabels[r.type]} · {r.subtitle}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : query.length >= 2 && !isLoading ? (
                                    <div className="py-8 text-center text-sm text-surface-400">
                                        Nenhum resultado para &ldquo;{query}&rdquo;
                                    </div>
                                ) : !query ? (
                                    <div className="py-8 text-center text-sm text-surface-400">
                                        Comece a digitar para pesquisar…
                                    </div>
                                ) : null}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center gap-4 px-4 py-2 border-t border-surface-200 dark:border-surface-700 text-[10px] text-surface-400">
                                <span><kbd className="px-1 py-0.5 bg-surface-200 dark:bg-surface-700 rounded">↑↓</kbd> navegar</span>
                                <span><kbd className="px-1 py-0.5 bg-surface-200 dark:bg-surface-700 rounded">↵</kbd> selecionar</span>
                                <span><kbd className="px-1 py-0.5 bg-surface-200 dark:bg-surface-700 rounded">esc</kbd> fechar</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
