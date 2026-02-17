'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { create } from 'zustand';

/* ─── Types ────────────────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

/* ─── Store ────────────────────────────────────────────────────── */
export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type = 'info') => {
        const id = crypto.randomUUID();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 4000);
    },
    removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/* ─── Helpers ──────────────────────────────────────────────────── */
export function toast(message: string, type?: ToastType) {
    useToastStore.getState().addToast(message, type);
}

const config: Record<ToastType, { icon: typeof Info; bg: string; border: string; text: string }> = {
    success: { icon: CheckCircle, bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    error: { icon: XCircle, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
};

/* ─── Component ────────────────────────────────────────────────── */
export function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);
    const removeToast = useToastStore((s) => s.removeToast);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((t) => {
                    const cfg = config[t.type];
                    const Icon = cfg.icon;
                    return (
                        <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl min-w-[300px] max-w-[420px] ${cfg.bg} ${cfg.border}`}
                        >
                            <Icon className={`w-5 h-5 shrink-0 ${cfg.text}`} />
                            <p className="text-sm text-surface-900 dark:text-surface-100 flex-1">{t.message}</p>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors shrink-0"
                                aria-label="Fechar notificação"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
