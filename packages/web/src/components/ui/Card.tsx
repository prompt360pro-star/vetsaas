'use client';

import React from 'react';

/* ── Types ───────────────────────────────────────── */

type CardVariant = 'default' | 'outlined' | 'elevated';

interface CardProps {
    children: React.ReactNode;
    variant?: CardVariant;
    /** Makes the card horizontally scrollable on mobile */
    scrollable?: boolean;
    /** Additional padding override */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
}

/* ── Config ──────────────────────────────────────── */

const variantClasses: Record<CardVariant, string> = {
    default:
        'bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border border-surface-200/60 dark:border-surface-800/60',
    outlined:
        'bg-transparent border-2 border-surface-200 dark:border-surface-700',
    elevated:
        'bg-white dark:bg-surface-900 shadow-lg shadow-surface-900/5 dark:shadow-black/20 border border-surface-100/50 dark:border-surface-800/50',
};

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
};

/* ── Component ───────────────────────────────────── */

export function Card({
    children,
    variant = 'default',
    scrollable = false,
    padding = 'md',
    className = '',
    onClick,
}: CardProps) {
    const Tag = onClick ? 'button' : 'div';

    return (
        <Tag
            onClick={onClick}
            className={`
                rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]}
                ${scrollable ? 'overflow-x-auto' : ''}
                ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow text-left w-full' : ''}
                ${className}
            `.trim()}
        >
            {children}
        </Tag>
    );
}

/* ── Sub-components ──────────────────────────────── */

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <h3 className={`text-sm font-semibold text-surface-900 dark:text-surface-50 ${className}`}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center gap-3 ${className}`}>
            {children}
        </div>
    );
}
