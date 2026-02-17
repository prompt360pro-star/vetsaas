'use client';

import { motion } from 'framer-motion';
import {
    Dog,
    Users,
    Calendar,
    CreditCard,
    TrendingUp,
    TrendingDown,
    Clock,
    Activity,
    ArrowRight,
    Stethoscope,
    Syringe,
    AlertCircle,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { formatKwanza } from '@vetsaas/shared';
import { useAuthStore } from '@/stores/auth-store';
import { useApi } from '@/lib/hooks/use-api';
import { dashboardApi, alertsApi } from '@/lib/services';
import { Sparkline } from '@/components/ui';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

/* ─── Fallback Mock Data ────────────────────────────────────────── */
const fallbackStats = {
    totalAnimals: 247,
    totalTutors: 189,
    todayAppointments: 18,
    monthlyRevenue: 3450000,
    animalsChange: 12,
    tutorsChange: 5,
    appointmentsChange: 3,
    revenueChange: 8.2,
};

const fallbackActivity = [
    { text: 'Prontuário atualizado para Rex', time: 'há 5 min', icon: Stethoscope },
    { text: 'Vacina administrada — Mimi (Antirrábica)', time: 'há 30 min', icon: Syringe },
    { text: 'Novo paciente registado — Luna', time: 'há 1 hora', icon: Dog },
    { text: 'Pagamento recebido — Kz 15.000', time: 'há 2 horas', icon: CreditCard },
];

const todayAppointments = [
    { time: '08:30', animal: 'Rex', species: '🐕', tutor: 'João Silva', type: 'Consulta', status: 'CHECKED_IN' },
    { time: '09:00', animal: 'Mimi', species: '🐈', tutor: 'Ana Santos', type: 'Vacinação', status: 'SCHEDULED' },
    { time: '09:30', animal: 'Thor', species: '🐕', tutor: 'Pedro Lopes', type: 'Follow-up', status: 'SCHEDULED' },
    { time: '10:00', animal: 'Luna', species: '🐈', tutor: 'Maria Fernandes', type: 'Emergência', status: 'SCHEDULED' },
    { time: '11:00', animal: 'Bolt', species: '🐕', tutor: 'Carlos Neto', type: 'Cirurgia', status: 'SCHEDULED' },
];

/* ─── Animation Variants ────────────────────────────────────────── */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const statusConfig: Record<string, { label: string; className: string }> = {
    CHECKED_IN: { label: 'Check-in', className: 'badge-success' },
    SCHEDULED: { label: 'Agendado', className: 'badge-info' },
    IN_PROGRESS: { label: 'Em curso', className: 'badge-warning' },
    COMPLETED: { label: 'Concluído', className: 'badge-success' },
    CANCELLED: { label: 'Cancelado', className: 'badge-danger' },
};

const alertConfig = {
    DANGER: { icon: AlertCircle, color: 'text-danger-dark dark:text-red-400', bg: 'bg-danger-light dark:bg-danger/10', border: 'border-danger/20' },
    WARNING: { icon: AlertTriangle, color: 'text-warning-dark dark:text-amber-400', bg: 'bg-warning-light dark:bg-warning/10', border: 'border-warning/20' },
    INFO: { icon: AlertCircle, color: 'text-info-dark dark:text-blue-400', bg: 'bg-info-light dark:bg-info/10', border: 'border-info/20' },
};

/* ─── Skeleton Component ────────────────────────────────────────── */
function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-lg bg-surface-200 dark:bg-surface-700 ${className}`} />
    );
}

/* ─── Component ─────────────────────────────────────────────────── */
export default function DashboardPage() {
    const { user } = useAuthStore();

    // Fetch real data with fallback
    const { data: apiStats, isLoading: statsLoading } = useApi(() => dashboardApi.fetchStats());
    const { data: alerts, isLoading: alertsLoading } = useApi(() => alertsApi.fetchAlerts());

    const stats = apiStats || fallbackStats;

    const statCards = [
        {
            label: 'Pacientes Activos',
            value: String(stats.totalAnimals),
            change: `+${stats.animalsChange}%`,
            trend: stats.animalsChange >= 0 ? 'up' as const : 'down' as const,
            icon: Dog,
            color: 'from-primary-500 to-primary-600',
            spark: [180, 195, 210, 205, 220, 230, 225, 240, 247],
            sparkVariant: 'primary' as const,
        },
        {
            label: 'Consultas Hoje',
            value: String(stats.todayAppointments),
            change: `+${stats.appointmentsChange}`,
            trend: stats.appointmentsChange >= 0 ? 'up' as const : 'down' as const,
            icon: Calendar,
            color: 'from-accent-500 to-accent-600',
            spark: [12, 15, 10, 18, 14, 20, 16, 18, 18],
            sparkVariant: 'accent' as const,
        },
        {
            label: 'Receita do Mês',
            value: formatKwanza(stats.monthlyRevenue),
            change: `+${stats.revenueChange.toFixed(1)}%`,
            trend: stats.revenueChange >= 0 ? 'up' as const : 'down' as const,
            icon: CreditCard,
            color: 'from-emerald-500 to-emerald-600',
            spark: [2100000, 2400000, 2800000, 2600000, 3100000, 2900000, 3200000, 3350000, 3450000],
            sparkVariant: 'success' as const,
        },
        {
            label: 'Tutores',
            value: String(stats.totalTutors),
            change: `+${stats.tutorsChange}`,
            trend: stats.tutorsChange >= 0 ? 'up' as const : 'down' as const,
            icon: Users,
            color: 'from-purple-500 to-purple-600',
            spark: [150, 155, 160, 165, 168, 175, 180, 185, 189],
            sparkVariant: 'purple' as const,
        },
    ];

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                    {greeting()}, {user?.firstName || 'Doutor'} 👋
                </h1>
                <p className="text-surface-500 dark:text-surface-400 mt-1">
                    Aqui está o resumo da sua clínica hoje.
                </p>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
                {statCards.map((stat) => (
                    <motion.div
                        key={stat.label}
                        variants={cardVariants}
                        className="glass-card p-5 hover:shadow-premium-lg transition-shadow duration-300"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                            >
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            {statsLoading ? (
                                <Skeleton className="w-12 h-5" />
                            ) : (
                                <div
                                    className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up'
                                        ? 'text-success-dark dark:text-green-400'
                                        : 'text-danger-dark dark:text-red-400'
                                        }`}
                                >
                                    {stat.trend === 'up' ? (
                                        <TrendingUp className="w-3.5 h-3.5" />
                                    ) : (
                                        <TrendingDown className="w-3.5 h-3.5" />
                                    )}
                                    {stat.change}
                                </div>
                            )}
                        </div>
                        {statsLoading ? (
                            <Skeleton className="w-20 h-8 mb-2" />
                        ) : (
                            <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                                {stat.value}
                            </p>
                        )}
                        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                            {stat.label}
                        </p>
                        <div className="mt-2 h-8">
                            <Sparkline data={stat.spark} variant={stat.sparkVariant} height={32} />
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Appointments */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 glass-card"
                >
                    <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-800">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-primary-600" />
                            <h2 className="font-semibold text-surface-900 dark:text-surface-50">
                                Agenda de Hoje
                            </h2>
                            <span className="badge badge-info">{todayAppointments.length} consultas</span>
                        </div>
                        <button className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            Ver todas <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="divide-y divide-surface-100 dark:divide-surface-800">
                        {todayAppointments.map((apt, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.05 }}
                                className="flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
                            >
                                <div className="text-sm font-mono font-medium text-surface-500 w-14">
                                    {apt.time}
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-lg">
                                    {apt.species}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
                                        {apt.animal}
                                        <span className="text-surface-400 dark:text-surface-500 font-normal ml-2">
                                            — {apt.tutor}
                                        </span>
                                    </p>
                                    <p className="text-xs text-surface-500 dark:text-surface-400">
                                        {apt.type}
                                    </p>
                                </div>
                                <span className={`badge ${statusConfig[apt.status]?.className || 'badge-info'}`}>
                                    {statusConfig[apt.status]?.label || apt.status}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <ActivityFeed maxItems={6} />
                </motion.div>
            </div>

            {/* Alerts & Reminders — wired to real API */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-5"
            >
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <h2 className="font-semibold text-surface-900 dark:text-surface-50">
                        Alertas & Lembretes
                    </h2>
                    {alertsLoading && <Loader2 className="w-4 h-4 text-surface-400 animate-spin" />}
                </div>

                {alertsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-20" />
                        ))}
                    </div>
                ) : alerts && alerts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {alerts.slice(0, 6).map((alert) => {
                            const cfg = alertConfig[alert.type] || alertConfig.INFO;
                            const AlertIcon = cfg.icon;
                            return (
                                <div key={alert.id} className={`p-4 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                                    <div className="flex items-start gap-2">
                                        <AlertIcon className={`w-4 h-4 mt-0.5 ${cfg.color} shrink-0`} />
                                        <div>
                                            <p className={`text-sm font-medium ${cfg.color}`}>
                                                {alert.title}
                                            </p>
                                            <p className="text-xs text-surface-600 dark:text-surface-400 mt-1">
                                                {alert.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Fallback mock alerts when API unavailable */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-warning-light dark:bg-warning/10 border border-warning/20">
                            <p className="text-sm font-medium text-warning-dark dark:text-amber-400">
                                3 vacinas vencidas
                            </p>
                            <p className="text-xs text-surface-600 dark:text-surface-400 mt-1">
                                Antirrábica — Rex, Luna, Bolt
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-danger-light dark:bg-danger/10 border border-danger/20">
                            <p className="text-sm font-medium text-danger-dark dark:text-red-400">
                                2 produtos com estoque baixo
                            </p>
                            <p className="text-xs text-surface-600 dark:text-surface-400 mt-1">
                                Amoxicilina, Ketamina
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-info-light dark:bg-info/10 border border-info/20">
                            <p className="text-sm font-medium text-info-dark dark:text-blue-400">
                                5 faturas pendentes
                            </p>
                            <p className="text-xs text-surface-600 dark:text-surface-400 mt-1">
                                Total: {formatKwanza(87500)}
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
