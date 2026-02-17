'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    loading?: boolean;
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    danger = false,
    loading = false,
}: ConfirmDialogProps) {
    const confirmRef = useRef<HTMLButtonElement>(null);

    // Focus confirm on open, close on Escape
    useEffect(() => {
        if (!open) return;
        confirmRef.current?.focus();
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-[61] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="glass-card p-6 w-full max-w-md shadow-2xl"
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="confirm-title"
                        >
                            <div className="flex items-start gap-4">
                                {danger && (
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 id="confirm-title" className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                                        {title}
                                    </h3>
                                    {description && (
                                        <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">
                                            {description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-surface-400 hover:text-surface-600 transition-colors shrink-0"
                                    aria-label="Fechar"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-6">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    ref={confirmRef}
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 ${danger
                                            ? 'text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25'
                                            : 'text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25'
                                        }`}
                                >
                                    {loading ? 'A processar...' : confirmLabel}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
