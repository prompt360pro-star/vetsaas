'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Search,
    Filter,
    Clock,
    User,
    Plus,
    Edit,
    Trash2,
    LogIn,
    Download,
    Eye,
    Activity,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui';
import { exportApi } from '@/lib/services';

/* ─── Action Configuration ──────────────────────────────────────── */
const actionConfig: Record<string, { label: string; icon: typeof Plus; color: string; bgColor: string }> = {
    CREATE: { label: 'Criação', icon: Plus, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
    UPDATE: { label: 'Atualização', icon: Edit, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    DELETE: { label: 'Eliminação', icon: Trash2, color: 'text-red-400', bgColor: 'bg-red-500/20' },
    LOGIN: { label: 'Login', icon: LogIn, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    EXPORT: { label: 'Exportação', icon: Download, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
    VIEW: { label: 'Visualização', icon: Eye, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
};

const entityLabels: Record<string, string> = {
    animal: 'Animal',
    tutor: 'Tutor',
    record: 'Prontuário',
    appointment: 'Consulta',
    payment: 'Pagamento',
    invoice: 'Fatura',
    inventory: 'Inventário',
    user: 'Utilizador',
};

/* ─── Mock Data ─────────────────────────────────────────────────── */
const mockAuditLogs = [
    {
        id: '1',
        action: 'CREATE',
        entityType: 'animal',
        entityId: 'a-001',
        userId: 'u-001',
        userName: 'Dr. Carlos Mendes',
        createdAt: new Date(Date.now() - 300000).toISOString(),
        newValues: { name: 'Rex', species: 'DOG' },
    },
    {
        id: '2',
        action: 'UPDATE',
        entityType: 'record',
        entityId: 'r-042',
        userId: 'u-001',
        userName: 'Dr. Carlos Mendes',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        oldValues: { status: 'DRAFT' },
        newValues: { status: 'COMPLETED' },
    },
    {
        id: '3',
        action: 'LOGIN',
        entityType: 'user',
        entityId: 'u-002',
        userId: 'u-002',
        userName: 'Ana Santos',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: '4',
        action: 'CREATE',
        entityType: 'appointment',
        entityId: 'ap-015',
        userId: 'u-003',
        userName: 'Maria Fernandes',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        newValues: { type: 'CONSULTATION', animal: 'Mimi' },
    },
    {
        id: '5',
        action: 'DELETE',
        entityType: 'inventory',
        entityId: 'inv-008',
        userId: 'u-001',
        userName: 'Dr. Carlos Mendes',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        oldValues: { name: 'Amoxicilina 500mg', stock: 0 },
    },
    {
        id: '6',
        action: 'CREATE',
        entityType: 'payment',
        entityId: 'pay-023',
        userId: 'u-003',
        userName: 'Maria Fernandes',
        createdAt: new Date(Date.now() - 18000000).toISOString(),
        newValues: { amount: 15000, method: 'MULTICAIXA_EXPRESS' },
    },
    {
        id: '7',
        action: 'UPDATE',
        entityType: 'tutor',
        entityId: 't-012',
        userId: 'u-002',
        userName: 'Ana Santos',
        createdAt: new Date(Date.now() - 28800000).toISOString(),
        oldValues: { phone: '+244 912 345 678' },
        newValues: { phone: '+244 923 456 789' },
    },
    {
        id: '8',
        action: 'EXPORT',
        entityType: 'invoice',
        entityId: 'inv-085',
        userId: 'u-001',
        userName: 'Dr. Carlos Mendes',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
    },
];

/* ─── Framer Variants ───────────────────────────────────────────── */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

/* ─── Helpers ───────────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `há ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `há ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `há ${days}d`;
}

/* ─── Component ─────────────────────────────────────────────────── */
export default function AuditPage() {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('ALL');
    const [entityFilter, setEntityFilter] = useState<string>('ALL');

    const filteredLogs = mockAuditLogs.filter((log) => {
        if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
        if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
        if (search) {
            const s = search.toLowerCase();
            return (
                log.userName.toLowerCase().includes(s) ||
                log.entityType.toLowerCase().includes(s) ||
                log.action.toLowerCase().includes(s)
            );
        }
        return true;
    });

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={rowVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        Registo de Auditoria
                    </h1>
                    <p className="text-white/60 mt-1">
                        Rastreio completo de todas as acções no sistema
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                    <Activity className="w-4 h-4" />
                    <span>{mockAuditLogs.length} eventos registados</span>
                </div>
                <button
                    onClick={() => exportApi.downloadAudit()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm"
                >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                </button>
            </motion.div>

            {/* Filters Bar */}
            <motion.div
                variants={rowVariants}
                className="card p-4 flex flex-wrap items-center gap-4"
            >
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        placeholder="Pesquisar por utilizador, acção ou entidade..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-white/40" />

                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                        aria-label="Filtrar por acção"
                    >
                        <option value="ALL">Todas as Acções</option>
                        {Object.entries(actionConfig).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                        ))}
                    </select>

                    <select
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                        aria-label="Filtrar por entidade"
                    >
                        <option value="ALL">Todas as Entidades</option>
                        {Object.entries(entityLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </motion.div>

            {/* Timeline */}
            <motion.div variants={containerVariants} className="space-y-2">
                {filteredLogs.length === 0 ? (
                    <motion.div
                        variants={rowVariants}
                        className="card p-12 text-center"
                    >
                        <Shield className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50">Nenhum evento encontrado</p>
                    </motion.div>
                ) : (
                    filteredLogs.map((log) => {
                        const cfg = actionConfig[log.action] || actionConfig.VIEW;
                        const ActionIcon = cfg.icon;

                        return (
                            <motion.div
                                key={log.id}
                                variants={rowVariants}
                                className="card p-4 hover:bg-white/[0.04] transition-colors group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`p-2.5 rounded-xl ${cfg.bgColor} shrink-0`}>
                                        <ActionIcon className={`w-4 h-4 ${cfg.color}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Action Badge */}
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bgColor} ${cfg.color}`}>
                                                {cfg.label}
                                            </span>

                                            {/* Entity Badge */}
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/70">
                                                {entityLabels[log.entityType] || log.entityType}
                                            </span>

                                            {log.entityId && (
                                                <span className="text-xs text-white/30 font-mono">
                                                    {log.entityId}
                                                </span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div className="mt-1.5 flex items-center gap-2 text-sm">
                                            <User className="w-3.5 h-3.5 text-white/40" />
                                            <span className="text-white/70">{log.userName}</span>
                                        </div>

                                        {/* Changed Values */}
                                        {(log.oldValues || log.newValues) && (
                                            <div className="mt-2 p-2.5 rounded-lg bg-black/20 text-xs font-mono space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {log.oldValues && (
                                                    <div className="text-red-400/80">
                                                        − {JSON.stringify(log.oldValues)}
                                                    </div>
                                                )}
                                                {log.newValues && (
                                                    <div className="text-emerald-400/80">
                                                        + {JSON.stringify(log.newValues)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <div className="text-xs text-white/40 flex items-center gap-1.5 shrink-0">
                                        <Clock className="w-3.5 h-3.5" />
                                        {timeAgo(log.createdAt)}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>

            {/* Pagination */}
            <motion.div
                variants={rowVariants}
                className="flex items-center justify-between"
            >
                <p className="text-sm text-white/40">
                    A mostrar {filteredLogs.length} de {mockAuditLogs.length} eventos
                </p>
                <div className="flex items-center gap-2">
                    <button
                        className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
                        disabled
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-medium">
                        1
                    </span>
                    <button
                        className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
                        disabled
                        aria-label="Próxima página"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
