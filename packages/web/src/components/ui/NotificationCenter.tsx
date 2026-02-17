'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Syringe,
    Calendar,
    CreditCard,
    AlertTriangle,
    CheckCircle2,
    X,
} from 'lucide-react';
import { useClickOutside } from '@/lib/hooks/useClickOutside';

/* ── Types ───────────────────────────────────────── */

interface Notification {
    id: string;
    type: 'vaccine' | 'appointment' | 'payment' | 'alert' | 'system';
    title: string;
    body: string;
    timestamp: Date;
    read: boolean;
}

const typeConfig: Record<
    Notification['type'],
    { icon: typeof Bell; color: string; bg: string }
> = {
    vaccine: { icon: Syringe, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    appointment: { icon: Calendar, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    payment: { icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    alert: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    system: { icon: CheckCircle2, color: 'text-surface-500', bg: 'bg-surface-50 dark:bg-surface-800' },
};

/* ── Helpers ─────────────────────────────────────── */

function relativeTime(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `há ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'ontem';
    if (days < 7) return `há ${days} dias`;
    return date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' });
}

function groupNotifications(items: Notification[]) {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];
    const now = new Date();

    for (const n of items) {
        const d = n.timestamp;
        if (d.toDateString() === now.toDateString()) today.push(n);
        else {
            const y = new Date(now);
            y.setDate(y.getDate() - 1);
            if (d.toDateString() === y.toDateString()) yesterday.push(n);
            else older.push(n);
        }
    }

    const groups: { label: string; items: Notification[] }[] = [];
    if (today.length) groups.push({ label: 'Hoje', items: today });
    if (yesterday.length) groups.push({ label: 'Ontem', items: yesterday });
    if (older.length) groups.push({ label: 'Anteriores', items: older });
    return groups;
}

/* ── Mock data ───────────────────────────────────── */

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000);
const d = (days: number) => new Date(now.getTime() - days * 86400000);

const mockNotifications: Notification[] = [
    { id: '1', type: 'vaccine', title: 'Vacina pendente', body: 'Rex — Antirrábica vencida há 3 dias', timestamp: h(1), read: false },
    { id: '2', type: 'appointment', title: 'Consulta em 30min', body: 'Mimi — Dra. Ana, 14:30', timestamp: h(0.5), read: false },
    { id: '3', type: 'payment', title: 'Pagamento recebido', body: 'João Silva — 15.000 AOA via Multicaixa', timestamp: h(3), read: false },
    { id: '4', type: 'alert', title: 'Stock baixo', body: 'Amoxicilina 500mg — restam 5 unidades', timestamp: h(5), read: true },
    { id: '5', type: 'system', title: 'Backup concluído', body: 'Backup automático realizado com sucesso', timestamp: d(1), read: true },
    { id: '6', type: 'appointment', title: 'Consulta cancelada', body: 'Thor — Pedro cancelou por motivos pessoais', timestamp: d(1), read: true },
    { id: '7', type: 'vaccine', title: 'Vacina agendada', body: 'Luna — V8 marcada para 20/02', timestamp: d(3), read: true },
];

/* ── Component ───────────────────────────────────── */

export function NotificationCenter() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

    const unread = notifications.filter((n) => !n.read).length;
    const groups = groupNotifications(notifications);

    const markRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    return (
        <div ref={ref} className="relative">
            {/* Bell trigger */}
            <button
                onClick={() => setOpen(!open)}
                aria-label="Notificações"
                className="relative w-9 h-9 rounded-xl bg-surface-50 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:text-primary-600 transition-colors"
            >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-danger rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    >
                        {unread > 9 ? '9+' : unread}
                    </motion.span>
                )}
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-800">
                            <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                                Notificações
                                {unread > 0 && (
                                    <span className="ml-2 text-xs font-normal text-surface-400">
                                        {unread} não lida{unread !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2">
                                {unread > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs text-primary-500 hover:text-primary-600 transition-colors"
                                    >
                                        Marcar todas
                                    </button>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                                    aria-label="Fechar"
                                >
                                    <X className="w-3.5 h-3.5 text-surface-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {groups.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
                                        <Bell className="w-6 h-6 text-surface-400" />
                                    </div>
                                    <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
                                        Sem notificações
                                    </p>
                                    <p className="text-xs text-surface-400 mt-1">
                                        Está tudo em dia! 🎉
                                    </p>
                                </div>
                            ) : (
                                groups.map((group) => (
                                    <div key={group.label}>
                                        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-surface-400 bg-surface-50/50 dark:bg-surface-900/50">
                                            {group.label}
                                        </div>
                                        {group.items.map((n) => {
                                            const cfg = typeConfig[n.type];
                                            const Icon = cfg.icon;
                                            return (
                                                <motion.button
                                                    key={n.id}
                                                    onClick={() => markRead(n.id)}
                                                    whileHover={{ x: 2 }}
                                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/60 ${!n.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className={`text-sm ${!n.read ? 'font-semibold text-surface-800 dark:text-surface-200' : 'font-medium text-surface-600 dark:text-surface-400'}`}>
                                                                {n.title}
                                                            </p>
                                                            {!n.read && (
                                                                <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                                                            {n.body}
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] text-surface-400 flex-shrink-0 mt-0.5">
                                                        {relativeTime(n.timestamp)}
                                                    </span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
