'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

function getPages(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = getPages(currentPage, totalPages);

    return (
        <nav aria-label="Paginação" className="flex items-center justify-center gap-1">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Página anterior"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-surface-400 text-sm">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === currentPage
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                            }`}
                        aria-current={p === currentPage ? 'page' : undefined}
                    >
                        {p}
                    </button>
                ),
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Página seguinte"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </nav>
    );
}
