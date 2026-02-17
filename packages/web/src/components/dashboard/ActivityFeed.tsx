'use client';

import { motion } from 'framer-motion';
import {
    Dog,
    Calendar,
    CreditCard,
    FileText,
    Syringe,
    UserPlus,
    Package,
} from 'lucide-react';

/* ── Types ───────────────────────────────────────── */

interface ActivityEvent {
    id: string;
    type: 'animal' | 'appointment' | 'payment' | 'record' | 'vaccine' | 'tutor' | 'inventory';
    title: string;
    description: string;
    timestamp: Date;
    actor?: string;
}

const typeConfig: Record<
    ActivityEvent['type'],
    { icon: typeof Dog; color: string; dot: string }
> = {
    animal: { icon: Dog, color: 'text-primary-500', dot: 'bg-primary-500' },
    appointment: { icon: Calendar, color: 'text-blue-500', dot: 'bg-blue-500' },
    payment: { icon: CreditCard, color: 'text-emerald-500', dot: 'bg-emerald-500' },
    record: { icon: FileText, color: 'text-violet-500', dot: 'bg-violet-500' },
    vaccine: { icon: Syringe, color: 'text-amber-500', dot: 'bg-amber-500' },
    tutor: { icon: UserPlus, color: 'text-rose-500', dot: 'bg-rose-500' },
    inventory: { icon: Package, color: 'text-cyan-500', dot: 'bg-cyan-500' },
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

/* ── Mock data ───────────────────────────────────── */

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000);
const d = (days: number) => new Date(now.getTime() - days * 86400000);

const mockActivity: ActivityEvent[] = [
    { id: '1', type: 'appointment', title: 'Consulta concluída', description: 'Rex — Vacinação de rotina', timestamp: h(0.5), actor: 'Dra. Ana' },
    { id: '2', type: 'payment', title: 'Pagamento registado', description: 'João Silva — 15.000 AOA (Multicaixa)', timestamp: h(1), actor: 'Sistema' },
    { id: '3', type: 'animal', title: 'Novo paciente', description: 'Bolt — Labrador, 2 anos', timestamp: h(2), actor: 'Dra. Ana' },
    { id: '4', type: 'vaccine', title: 'Vacina aplicada', description: 'Mimi — Antirrábica', timestamp: h(3.5), actor: 'Dra. Ana' },
    { id: '5', type: 'record', title: 'Prontuário actualizado', description: 'Thor — Nota de acompanhamento adicionada', timestamp: h(5), actor: 'Dr. Carlos' },
    { id: '6', type: 'tutor', title: 'Novo tutor', description: 'Maria Fernandes — Luanda, Viana', timestamp: d(1), actor: 'Recepção' },
    { id: '7', type: 'inventory', title: 'Stock actualizado', description: 'Amoxicilina 500mg — entrada de 50 unidades', timestamp: d(1), actor: 'Farmácia' },
    { id: '8', type: 'appointment', title: 'Consulta agendada', description: 'Luna — Check-up geral, 22/02', timestamp: d(2), actor: 'Recepção' },
];

/* ── Component ───────────────────────────────────── */

interface ActivityFeedProps {
    maxItems?: number;
}

export function ActivityFeed({ maxItems = 8 }: ActivityFeedProps) {
    const events = mockActivity.slice(0, maxItems);

    return (
        <div className="rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-5">
            <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-200 mb-4">
                Actividade Recente
            </h3>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-surface-200 dark:bg-surface-700" />

                <div className="space-y-1">
                    {events.map((event, idx) => {
                        const cfg = typeConfig[event.type];
                        const Icon = cfg.icon;
                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative flex items-start gap-3 py-2.5 group"
                            >
                                {/* Dot */}
                                <div className="relative z-10 w-[30px] flex items-center justify-center flex-shrink-0">
                                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ring-4 ring-white dark:ring-surface-900 transition-transform group-hover:scale-125`} />
                                </div>

                                {/* Icon */}
                                <div className={`w-8 h-8 rounded-lg bg-surface-50 dark:bg-surface-800 flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                                        {event.title}
                                    </p>
                                    <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                                        {event.description}
                                    </p>
                                </div>

                                {/* Meta */}
                                <div className="flex flex-col items-end flex-shrink-0 text-right">
                                    <span className="text-[10px] text-surface-400">
                                        {relativeTime(event.timestamp)}
                                    </span>
                                    {event.actor && (
                                        <span className="text-[10px] text-surface-400/70">
                                            {event.actor}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
