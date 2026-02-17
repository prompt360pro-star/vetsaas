'use client';

import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

/* ── Types ───────────────────────────────────────── */

export interface Tab {
    id: string;
    label: string;
    icon?: LucideIcon;
    /** Badge count */
    badge?: number;
    disabled?: boolean;
}

type TabVariant = 'underline' | 'pills';

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
    /** Visual style */
    variant?: TabVariant;
    /** Full width tabs */
    fullWidth?: boolean;
    className?: string;
}

/* ── Component ───────────────────────────────────── */

export function Tabs({
    tabs,
    activeTab,
    onChange,
    variant = 'underline',
    fullWidth = false,
    className = '',
}: TabsProps) {
    const layoutId = useId();

    return (
        <div
            className={`${variant === 'underline'
                    ? 'border-b border-surface-200 dark:border-surface-700'
                    : 'bg-surface-100 dark:bg-surface-800 rounded-xl p-1'
                } ${className}`}
            role="tablist"
        >
            <div className={`flex ${fullWidth ? '' : 'gap-1'}`}>
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`panel-${tab.id}`}
                            disabled={tab.disabled}
                            onClick={() => onChange(tab.id)}
                            className={`relative flex items-center justify-center gap-2 text-sm font-medium transition-colors
                                ${fullWidth ? 'flex-1' : ''}
                                ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                ${variant === 'underline'
                                    ? `px-4 py-2.5 -mb-px ${isActive
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                                    }`
                                    : `px-3 py-2 rounded-lg ${isActive
                                        ? 'text-surface-900 dark:text-surface-50'
                                        : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                                    }`
                                }
                            `}
                        >
                            {/* Active Indicator */}
                            {isActive && variant === 'underline' && (
                                <motion.div
                                    layoutId={`tab-indicator-${layoutId}`}
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            {isActive && variant === 'pills' && (
                                <motion.div
                                    layoutId={`tab-pill-${layoutId}`}
                                    className="absolute inset-0 bg-white dark:bg-surface-700 rounded-lg shadow-sm"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}

                            {/* Content */}
                            <span className="relative z-10 flex items-center gap-2">
                                {Icon && <Icon className="w-4 h-4" />}
                                {tab.label}
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-primary-500 text-white">
                                        {tab.badge > 99 ? '99+' : tab.badge}
                                    </span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Tab Panel ───────────────────────────────────── */

interface TabPanelProps {
    tabId: string;
    activeTab: string;
    children: React.ReactNode;
    className?: string;
}

export function TabPanel({ tabId, activeTab, children, className = '' }: TabPanelProps) {
    if (tabId !== activeTab) return null;

    return (
        <motion.div
            id={`panel-${tabId}`}
            role="tabpanel"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
