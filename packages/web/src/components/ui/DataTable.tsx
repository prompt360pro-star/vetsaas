'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Search,
    MoreVertical,
    type LucideIcon,
} from 'lucide-react';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';

/* ── Types ───────────────────────────────────────── */

export interface DataTableColumn<T> {
    key: string;
    label: string;
    sortable?: boolean;
    /** Custom cell renderer */
    render?: (row: T, index: number) => React.ReactNode;
    /** Width hint (CSS value) */
    width?: string;
    /** Text alignment */
    align?: 'left' | 'center' | 'right';
}

export interface DataTableAction<T> {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: 'default' | 'danger';
    hidden?: (row: T) => boolean;
}

interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    actions?: DataTableAction<T>[];
    /** Unique key extractor per row */
    keyExtractor: (row: T) => string;
    /** Enable client-side search */
    searchable?: boolean;
    searchPlaceholder?: string;
    /** Columns to search (keys) — defaults to all */
    searchKeys?: string[];
    /** Rows per page (0 = no pagination) */
    pageSize?: number;
    /** Show loading skeleton */
    loading?: boolean;
    /** Empty state icon (LucideIcon) */
    emptyIcon?: LucideIcon;
    emptyTitle?: string;
    emptyDescription?: string;
    /** Header slot (buttons, filters) */
    headerRight?: React.ReactNode;
    /** Row click handler */
    onRowClick?: (row: T) => void;
}

type SortDir = 'asc' | 'desc' | null;

/* ── Helpers ─────────────────────────────────────── */

function getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((acc: unknown, key) => {
        if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
        return undefined;
    }, obj);
}

/* ── Component ───────────────────────────────────── */

export function DataTable<T>({
    columns,
    data,
    actions,
    keyExtractor,
    searchable = false,
    searchPlaceholder = 'Pesquisar…',
    searchKeys,
    pageSize = 10,
    loading = false,
    emptyIcon,
    emptyTitle = 'Sem dados',
    emptyDescription = 'Nenhum registo encontrado.',
    headerRight,
    onRowClick,
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);
    const [page, setPage] = useState(1);
    const [openAction, setOpenAction] = useState<string | null>(null);

    // ── Search filter ────
    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        const keys = searchKeys || columns.map((c) => c.key);
        return data.filter((row) =>
            keys.some((k) => {
                const val = getNestedValue(row, k);
                if (val == null) return false;
                return String(val).toLowerCase().includes(q);
            }),
        );
    }, [data, search, searchKeys, columns]);

    // ── Sort ────
    const sorted = useMemo(() => {
        if (!sortKey || !sortDir) return filtered;
        return [...filtered].sort((a, b) => {
            const av = getNestedValue(a, sortKey);
            const bv = getNestedValue(b, sortKey);
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            const cmp =
                typeof av === 'number' && typeof bv === 'number'
                    ? av - bv
                    : String(av).localeCompare(String(bv), 'pt');
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [filtered, sortKey, sortDir]);

    // ── Pagination ────
    const totalPages = pageSize > 0 ? Math.ceil(sorted.length / pageSize) : 1;
    const paginated = pageSize > 0 ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

    // Reset page when search changes
    const handleSearch = useCallback((val: string) => {
        setSearch(val);
        setPage(1);
    }, []);

    const handleSort = useCallback(
        (key: string) => {
            if (sortKey === key) {
                if (sortDir === 'asc') setSortDir('desc');
                else if (sortDir === 'desc') {
                    setSortKey(null);
                    setSortDir(null);
                }
            } else {
                setSortKey(key);
                setSortDir('asc');
            }
            setPage(1);
        },
        [sortKey, sortDir],
    );

    /* ── Loading skeleton ── */
    if (loading) {
        return (
            <div className="rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface-50 dark:bg-surface-900">
                                {columns.map((col) => (
                                    <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: pageSize || 5 }).map((_, i) => (
                                <tr key={i} className="border-t border-surface-100 dark:border-surface-800">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3">
                                            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* ── Header row ── */}
            {(searchable || headerRight) && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {searchable && (
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                            />
                        </div>
                    )}
                    {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
                </div>
            )}

            {/* ── Table ── */}
            <div className="rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden bg-white dark:bg-surface-900">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface-50 dark:bg-surface-900/80">
                                {columns.map((col) => {
                                    const isSorted = sortKey === col.key;
                                    return (
                                        <th
                                            key={col.key}
                                            style={{ width: col.width }}
                                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider select-none
                                                ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                                                ${col.sortable ? 'cursor-pointer hover:text-primary-600 dark:hover:text-primary-400' : ''}
                                                ${isSorted ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 dark:text-surface-400'}
                                            `}
                                            onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                {col.label}
                                                {col.sortable && (
                                                    <span className="inline-flex flex-col">
                                                        {isSorted && sortDir === 'asc' ? (
                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                        ) : isSorted && sortDir === 'desc' ? (
                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                                                        )}
                                                    </span>
                                                )}
                                            </span>
                                        </th>
                                    );
                                })}
                                {actions && actions.length > 0 && (
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider w-12">
                                        Ações
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {paginated.map((row, idx) => {
                                    const rowKey = keyExtractor(row);
                                    return (
                                        <motion.tr
                                            key={rowKey}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ delay: idx * 0.03 }}
                                            onClick={() => onRowClick?.(row)}
                                            className={`border-t border-surface-100 dark:border-surface-800 transition-colors
                                                ${onRowClick ? 'cursor-pointer hover:bg-primary-50/50 dark:hover:bg-primary-900/10' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'}
                                            `}
                                        >
                                            {columns.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className={`px-4 py-3 text-sm text-surface-700 dark:text-surface-300 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                                                >
                                                    {col.render
                                                        ? col.render(row, idx)
                                                        : String(getNestedValue(row, col.key) ?? '—')}
                                                </td>
                                            ))}
                                            {actions && actions.length > 0 && (
                                                <td className="px-4 py-3 text-right relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenAction(openAction === rowKey ? null : rowKey);
                                                        }}
                                                        aria-label="Ações"
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                                                    >
                                                        <MoreVertical className="w-4 h-4 text-surface-400" />
                                                    </button>
                                                    <AnimatePresence>
                                                        {openAction === rowKey && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                transition={{ duration: 0.1 }}
                                                                className="absolute right-4 top-full z-20 mt-1 min-w-[160px] rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-xl py-1"
                                                            >
                                                                {actions
                                                                    .filter((a) => !a.hidden?.(row))
                                                                    .map((action, ai) => (
                                                                        <button
                                                                            key={ai}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                action.onClick(row);
                                                                                setOpenAction(null);
                                                                            }}
                                                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                                                                                ${action.variant === 'danger'
                                                                                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                                    : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700'
                                                                                }
                                                                            `}
                                                                        >
                                                                            {action.icon}
                                                                            {action.label}
                                                                        </button>
                                                                    ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </td>
                                            )}
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* ── Empty state ── */}
                {paginated.length === 0 && (
                    <div className="py-12">
                        <EmptyState
                            icon={emptyIcon}
                            title={search ? 'Sem resultados' : emptyTitle}
                            description={search ? `Nenhum resultado para "${search}".` : emptyDescription}
                        />
                    </div>
                )}
            </div>

            {/* ── Pagination ── */}
            {pageSize > 0 && totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            )}

            {/* ── Row count ── */}
            {sorted.length > 0 && (
                <p className="text-xs text-surface-400 text-center">
                    {sorted.length === data.length
                        ? `${data.length} registo${data.length !== 1 ? 's' : ''}`
                        : `${sorted.length} de ${data.length} registo${data.length !== 1 ? 's' : ''}`
                    }
                </p>
            )}

            {/* ── Click-away for action menu ── */}
            {openAction && (
                <div className="fixed inset-0 z-10" onClick={() => setOpenAction(null)} />
            )}
        </div>
    );
}
