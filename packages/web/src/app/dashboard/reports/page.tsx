'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Dog,
    Cat,
    Users,
    Calendar,
    CreditCard,
    Package,
    AlertTriangle,
    AlertCircle,
    Info,
    Stethoscope,
    PieChart,
    Activity,
    ArrowUpRight,
} from 'lucide-react';

/* ─── Animation Variants ────────────────────────────────────────── */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

/* ─── Mock Data ─────────────────────────────────────────────────── */
const kpiCards = [
    {
        label: 'Consultas este Mês',
        value: '147',
        change: '+12%',
        trend: 'up' as const,
        icon: Stethoscope,
        gradient: 'from-blue-500 to-blue-600',
    },
    {
        label: 'Receita Mensal',
        value: 'Kz 2.4M',
        change: '+8%',
        trend: 'up' as const,
        icon: CreditCard,
        gradient: 'from-emerald-500 to-emerald-600',
    },
    {
        label: 'Novos Pacientes',
        value: '23',
        change: '+15%',
        trend: 'up' as const,
        icon: Dog,
        gradient: 'from-purple-500 to-purple-600',
    },
    {
        label: 'Stock em Alerta',
        value: '5',
        change: '-2',
        trend: 'down' as const,
        icon: Package,
        gradient: 'from-amber-500 to-amber-600',
    },
];

const speciesDistribution = [
    { species: 'Cães', count: 156, percentage: 52, icon: Dog, color: 'bg-blue-500' },
    { species: 'Gatos', count: 89, percentage: 30, icon: Cat, color: 'bg-purple-500' },
    { species: 'Aves', count: 28, percentage: 9, icon: Activity, color: 'bg-amber-500' },
    { species: 'Outros', count: 27, percentage: 9, icon: PieChart, color: 'bg-emerald-500' },
];

const topVeterinarians = [
    { name: 'Dr. Carlos Mendes', consultations: 48, revenue: 'Kz 890.000', specialty: 'Cirurgia' },
    { name: 'Dra. Ana Santos', consultations: 42, revenue: 'Kz 756.000', specialty: 'Dermatologia' },
    { name: 'Dr. Pedro Neto', consultations: 35, revenue: 'Kz 630.000', specialty: 'Geral' },
    { name: 'Dra. Maria Fernandes', consultations: 22, revenue: 'Kz 396.000', specialty: 'Odontologia' },
];

const mockAlerts = [
    { id: '1', type: 'DANGER' as const, title: 'Stock esgotado', description: 'Amoxicilina 500mg: 0/10 frascos', category: 'LOW_STOCK' },
    { id: '2', type: 'DANGER' as const, title: 'Stock esgotado', description: 'Ketamina 10ml: 0/5 frascos', category: 'LOW_STOCK' },
    { id: '3', type: 'WARNING' as const, title: 'Prontuário não assinado', description: 'Prontuário há mais de 24h sem assinatura', category: 'UNSIGNED_RECORD' },
    { id: '4', type: 'WARNING' as const, title: 'Stock baixo', description: 'Seringas 5ml: 3/20 unidades', category: 'LOW_STOCK' },
    { id: '5', type: 'INFO' as const, title: 'Vacina em atraso', description: 'Rex - Antirrábica vencida há 30 dias', category: 'OVERDUE_VACCINE' },
];

const monthlyData = [
    { month: 'Set', consultations: 98, revenue: 1800000 },
    { month: 'Out', consultations: 112, revenue: 2016000 },
    { month: 'Nov', consultations: 125, revenue: 2250000 },
    { month: 'Dez', consultations: 108, revenue: 1944000 },
    { month: 'Jan', consultations: 134, revenue: 2412000 },
    { month: 'Fev', consultations: 147, revenue: 2400000 },
];

/* ─── Helpers ───────────────────────────────────────────────────── */
const alertConfig = {
    DANGER: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/20' },
    WARNING: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/20' },
    INFO: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20' },
};

/* ─── Component ─────────────────────────────────────────────────── */
export default function ReportsPage() {
    const [period] = useState<'week' | 'month' | 'quarter'>('month');

    const maxConsultations = Math.max(...monthlyData.map((d) => d.consultations));

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={cardVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        Relatórios & Análises
                    </h1>
                    <p className="text-white/60 mt-1">
                        Visão geral do desempenho da clínica — {period === 'month' ? 'Este mês' : period === 'week' ? 'Esta semana' : 'Este trimestre'}
                    </p>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div
                            key={kpi.label}
                            variants={cardVariants}
                            className="card p-5 hover:bg-white/[0.04] transition-colors group"
                        >
                            <div className="flex items-start justify-between">
                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                    {kpi.trend === 'up' ? (
                                        <TrendingUp className="w-3.5 h-3.5" />
                                    ) : (
                                        <TrendingDown className="w-3.5 h-3.5" />
                                    )}
                                    {kpi.change}
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold text-white">{kpi.value}</p>
                                <p className="text-sm text-white/50 mt-0.5">{kpi.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Consultations Chart */}
                <motion.div variants={cardVariants} className="card p-5 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Consultas por Mês</h2>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            +9.7% vs mês anterior
                        </div>
                    </div>
                    <div className="flex items-end gap-3 h-48">
                        {monthlyData.map((d) => {
                            const height = (d.consultations / maxConsultations) * 100;
                            return (
                                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-xs text-white/50">{d.consultations}</span>
                                    <div className="w-full relative group">
                                        <div
                                            className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition-all group-hover:from-primary-500 group-hover:to-primary-300"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        />
                                    </div>
                                    <span className="text-xs text-white/40">{d.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Species Distribution */}
                <motion.div variants={cardVariants} className="card p-5">
                    <h2 className="text-lg font-semibold text-white mb-4">Distribuição por Espécie</h2>
                    <div className="space-y-4">
                        {speciesDistribution.map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.species}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-white/60" />
                                            <span className="text-sm text-white/70">{s.species}</span>
                                        </div>
                                        <span className="text-sm font-medium text-white">{s.count}</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${s.color}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${s.percentage}%` }}
                                            transition={{ duration: 0.8, delay: 0.3 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/40">Total de pacientes</span>
                            <span className="text-white font-semibold">
                                {speciesDistribution.reduce((sum, s) => sum + s.count, 0)}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Veterinarians */}
                <motion.div variants={cardVariants} className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-white/60" />
                        <h2 className="text-lg font-semibold text-white">Top Veterinários</h2>
                    </div>
                    <div className="space-y-3">
                        {topVeterinarians.map((vet, i) => (
                            <div
                                key={vet.name}
                                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-sm font-bold text-white">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{vet.name}</p>
                                    <p className="text-xs text-white/40">{vet.specialty}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-white">{vet.consultations}</p>
                                    <p className="text-xs text-white/40">{vet.revenue}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Active Alerts */}
                <motion.div variants={cardVariants} className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <h2 className="text-lg font-semibold text-white">Alertas Activos</h2>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                            {mockAlerts.filter((a) => a.type === 'DANGER').length} críticos
                        </span>
                    </div>
                    <div className="space-y-2">
                        {mockAlerts.map((alert) => {
                            const cfg = alertConfig[alert.type];
                            const AlertIcon = cfg.icon;
                            return (
                                <div
                                    key={alert.id}
                                    className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
                                >
                                    <AlertIcon className={`w-4 h-4 mt-0.5 ${cfg.color} shrink-0`} />
                                    <div className="min-w-0">
                                        <p className={`text-sm font-medium ${cfg.color}`}>{alert.title}</p>
                                        <p className="text-xs text-white/50 mt-0.5">{alert.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Monthly Revenue */}
            <motion.div variants={cardVariants} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-white/60" />
                        <h2 className="text-lg font-semibold text-white">Receita Mensal (AOA)</h2>
                    </div>
                </div>
                <div className="grid grid-cols-6 gap-3">
                    {monthlyData.map((d) => (
                        <div key={d.month} className="text-center p-3 rounded-xl bg-white/[0.02]">
                            <p className="text-xs text-white/40 mb-1">{d.month}</p>
                            <p className="text-sm font-semibold text-white">
                                {(d.revenue / 1000000).toFixed(1)}M
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
