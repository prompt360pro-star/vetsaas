'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    LayoutDashboard,
    Dog,
    Users,
    Calendar,
    FileText,
    CreditCard,
    Package,
    Settings,
    Shield,
    BarChart3,
    Plus,
    Moon,
    Sun,
    LogOut,
    Command,
} from 'lucide-react';
import { useTheme } from '@/lib/hooks/useTheme';

/* ── Types ───────────────────────────────────────── */

interface PaletteCommand {
    id: string;
    label: string;
    group: 'navigation' | 'action' | 'settings';
    icon: typeof Search;
    shortcut?: string;
    action: () => void;
}

const groupLabels: Record<string, string> = {
    navigation: 'Navegação',
    action: 'Ações',
    settings: 'Configurações',
};

/* ── Fuzzy match ─────────────────────────────────── */

function fuzzyMatch(query: string, text: string): boolean {
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    let qi = 0;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] === q[qi]) qi++;
    }
    return qi === q.length;
}

/* ── Component ───────────────────────────────────── */

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { isDark, toggle: toggleTheme } = useTheme();

    const navigate = useCallback(
        (path: string) => {
            router.push(path);
            setOpen(false);
        },
        [router],
    );

    const commands: PaletteCommand[] = useMemo(
        () => [
            { id: 'dashboard', label: 'Dashboard', group: 'navigation', icon: LayoutDashboard, action: () => navigate('/dashboard') },
            { id: 'animals', label: 'Pacientes', group: 'navigation', icon: Dog, action: () => navigate('/dashboard/animals') },
            { id: 'tutors', label: 'Tutores', group: 'navigation', icon: Users, action: () => navigate('/dashboard/tutors') },
            { id: 'appointments', label: 'Agenda', group: 'navigation', icon: Calendar, action: () => navigate('/dashboard/appointments') },
            { id: 'records', label: 'Prontuários', group: 'navigation', icon: FileText, action: () => navigate('/dashboard/records') },
            { id: 'payments', label: 'Financeiro', group: 'navigation', icon: CreditCard, action: () => navigate('/dashboard/payments') },
            { id: 'inventory', label: 'Inventário', group: 'navigation', icon: Package, action: () => navigate('/dashboard/inventory') },
            { id: 'audit', label: 'Auditoria', group: 'navigation', icon: Shield, action: () => navigate('/dashboard/audit') },
            { id: 'reports', label: 'Relatórios', group: 'navigation', icon: BarChart3, action: () => navigate('/dashboard/reports') },
            { id: 'settings', label: 'Configurações', group: 'navigation', icon: Settings, action: () => navigate('/dashboard/settings') },
            { id: 'new-animal', label: 'Novo Paciente', group: 'action', icon: Plus, action: () => navigate('/dashboard/animals?new=1') },
            { id: 'new-appointment', label: 'Nova Consulta', group: 'action', icon: Plus, action: () => navigate('/dashboard/appointments?new=1') },
            { id: 'new-tutor', label: 'Novo Tutor', group: 'action', icon: Plus, action: () => navigate('/dashboard/tutors?new=1') },
            { id: 'toggle-theme', label: isDark ? 'Modo Claro' : 'Modo Escuro', group: 'settings', icon: isDark ? Sun : Moon, action: () => { toggleTheme(); setOpen(false); } },
            { id: 'logout', label: 'Terminar Sessão', group: 'settings', icon: LogOut, action: () => navigate('/login') },
        ],
        [navigate, isDark, toggleTheme],
    );

    // Filtered commands
    const filtered = useMemo(() => {
        if (!search.trim()) return commands;
        return commands.filter((c) => fuzzyMatch(search, c.label));
    }, [commands, search]);

    // Grouped
    const groups = useMemo(() => {
        const map = new Map<string, PaletteCommand[]>();
        for (const cmd of filtered) {
            const group = map.get(cmd.group) || [];
            group.push(cmd);
            map.set(cmd.group, group);
        }
        return Array.from(map.entries()).map(([key, items]) => ({
            key,
            label: groupLabels[key] || key,
            items,
        }));
    }, [filtered]);

    const flatFiltered = useMemo(() => groups.flatMap((g) => g.items), [groups]);

    // ── Keyboard shortcut: Cmd+K / Ctrl+K ──
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Focus input when opening
    useEffect(() => {
        if (open) {
            setSearch('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Scroll active item into view
    useEffect(() => {
        const el = listRef.current?.querySelector('[data-active="true"]');
        el?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && flatFiltered[activeIndex]) {
                e.preventDefault();
                flatFiltered[activeIndex].action();
            }
        },
        [flatFiltered, activeIndex],
    );

    // Reset active index when search changes
    useEffect(() => { setActiveIndex(0); }, [search]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -20 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
                    >
                        <div className="rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xl overflow-hidden">
                            {/* Search input */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-100 dark:border-surface-800">
                                <Search className="w-5 h-5 text-surface-400 flex-shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Pesquisar comandos…"
                                    className="flex-1 bg-transparent text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 outline-none"
                                />
                                <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-[10px] font-mono text-surface-400 border border-surface-200 dark:border-surface-700">
                                    ESC
                                </kbd>
                            </div>

                            {/* Results */}
                            <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2">
                                {groups.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <p className="text-sm text-surface-500">Nenhum resultado para &ldquo;{search}&rdquo;</p>
                                    </div>
                                ) : (
                                    groups.map((group) => (
                                        <div key={group.key}>
                                            <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-surface-400">
                                                {group.label}
                                            </div>
                                            {group.items.map((cmd) => {
                                                const idx = flatFiltered.indexOf(cmd);
                                                const isActive = idx === activeIndex;
                                                const Icon = cmd.icon;
                                                return (
                                                    <button
                                                        key={cmd.id}
                                                        data-active={isActive}
                                                        onClick={() => cmd.action()}
                                                        onMouseEnter={() => setActiveIndex(idx)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive
                                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                                : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800/60'
                                                            }`}
                                                    >
                                                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-500' : 'text-surface-400'}`} />
                                                        <span className="flex-1 text-sm">
                                                            {cmd.label}
                                                        </span>
                                                        {cmd.shortcut && (
                                                            <kbd className="text-[10px] font-mono text-surface-400 bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">
                                                                {cmd.shortcut}
                                                            </kbd>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-4 py-2 border-t border-surface-100 dark:border-surface-800 text-[10px] text-surface-400">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1 py-0.5 rounded bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 font-mono">↑↓</kbd>
                                        navegar
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1 py-0.5 rounded bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 font-mono">↵</kbd>
                                        selecionar
                                    </span>
                                </div>
                                <span className="flex items-center gap-1">
                                    <Command className="w-3 h-3" />K para abrir
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
