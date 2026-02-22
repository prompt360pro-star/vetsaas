'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Search,
    Filter,
    Download,
    ArrowDownRight,
    ArrowUpRight,
    Receipt,
    Landmark,
    Smartphone,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    Plus,
} from 'lucide-react';
import { Input } from '@/components/ui';
import { formatKwanza } from '@vetsaas/shared';
import InvoiceModal from '@/components/payments/InvoiceModal';
import type { InvoiceFormData } from '@/components/payments/InvoiceModal';
import '@/components/payments/InvoiceModal.css';
import { exportApi, paymentsApi } from '@/lib/services';
import { toast } from '@/components/ui/Toast';

type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

const statusConfig: Record<PaymentStatus, { label: string; badge: string; icon: typeof CheckCircle }> = {
    COMPLETED: { label: 'Pago', badge: 'badge-success', icon: CheckCircle },
    PENDING: { label: 'Pendente', badge: 'badge-warning', icon: Clock },
    FAILED: { label: 'Falhou', badge: 'badge-danger', icon: XCircle },
};

const methodIcons: Record<string, { icon: typeof CreditCard; label: string }> = {
    MULTICAIXA_GPO: { icon: Landmark, label: 'Multicaixa GPO' },
    MULTICAIXA_EXPRESS: { icon: CreditCard, label: 'Multicaixa Express' },
    UNITEL_MONEY: { icon: Smartphone, label: 'Unitel Money' },
    CASH: { icon: Receipt, label: 'Numerário' },
};

const mockPayments = [
    { id: '1', reference: 'FAT-2024-001', description: 'Consulta + vacinação — Rex', tutor: 'João Silva', amount: 15000, method: 'MULTICAIXA_EXPRESS', status: 'COMPLETED' as PaymentStatus, date: '2024-12-11' },
    { id: '2', reference: 'FAT-2024-002', description: 'Cirurgia (orquiectomia) — Thor', tutor: 'Pedro Lopes', amount: 85000, method: 'MULTICAIXA_GPO', status: 'COMPLETED' as PaymentStatus, date: '2024-12-09' },
    { id: '3', reference: 'FAT-2024-003', description: 'Consulta geral — Mimi', tutor: 'Ana Santos', amount: 8500, method: 'CASH', status: 'COMPLETED' as PaymentStatus, date: '2024-12-11' },
    { id: '4', reference: 'FAT-2024-004', description: 'Emergência — Luna', tutor: 'Maria Fernandes', amount: 25000, method: 'UNITEL_MONEY', status: 'PENDING' as PaymentStatus, date: '2024-12-12' },
    { id: '5', reference: 'FAT-2024-005', description: 'Banho + tosquia — Princesa', tutor: 'Luísa Mendes', amount: 5000, method: 'MULTICAIXA_EXPRESS', status: 'FAILED' as PaymentStatus, date: '2024-12-11' },
    { id: '6', reference: 'FAT-2024-006', description: 'Check-up anual — Bolt', tutor: 'Carlos Neto', amount: 12000, method: 'CASH', status: 'PENDING' as PaymentStatus, date: '2024-12-12' },
];

const summaryStats = [
    { label: 'Receita Total', value: formatKwanza(3450000), change: '+8.2%', up: true, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Recebido', value: formatKwanza(108500), change: '3 pagamentos', up: true, color: 'from-primary-500 to-primary-600' },
    { label: 'Pendente', value: formatKwanza(37000), change: '2 faturas', up: false, color: 'from-amber-500 to-amber-600' },
    { label: 'Ticket Médio', value: formatKwanza(25083), change: '+5.3%', up: true, color: 'from-purple-500 to-purple-600' },
];

export default function PaymentsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    const handleCreateInvoice = async (data: InvoiceFormData) => {
        try {
            // 1. Prepare Invoice Payload
            const invoicePayload = {
                tutorId: data.tutorId === 'manual-entry' || !data.tutorId ? crypto.randomUUID() : data.tutorId,
                tutorName: data.tutorName,
                items: data.items,
                dueDate: data.dueDate,
                notes: data.notes,
                taxRate: data.taxRate ?? 14,
            };

            // 2. Create Invoice
            const invoice = await paymentsApi.createInvoice(invoicePayload);
            toast(`Fatura ${invoice.invoiceNumber} criada!`, 'success');

            // 3. Create Payment (if method selected)
            if (data.paymentMethod) {
                try {
                    const payment = await paymentsApi.createPayment({
                        invoiceId: invoice.id,
                        amount: invoice.total,
                        method: data.paymentMethod,
                        tutorName: data.tutorName,
                        description: `Pagamento da Fatura ${invoice.invoiceNumber}`,
                    });
                    toast('Pagamento registado!', 'success');

                    // 4. Mark as Paid (if CASH/completed)
                    if (payment.status === 'COMPLETED') {
                        await paymentsApi.markInvoiceAsPaid(invoice.id, payment.id);
                        toast('Fatura marcada como paga!', 'success');
                    }
                } catch (paymentError) {
                    console.error('[CREATE PAYMENT] Error:', paymentError);
                    toast('Fatura criada, mas erro ao registar pagamento.', 'warning');
                }
            }

            setIsInvoiceModalOpen(false);

        } catch (error) {
            console.error('[CREATE INVOICE] Error:', error);
            toast('Erro ao criar fatura. Tente novamente.', 'error');
        }
    };

    const filtered = mockPayments.filter((p) => {
        const matchesSearch =
            p.reference.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()) ||
            p.tutor.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        Financeiro
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        Pagamentos e faturação
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => exportApi.downloadPayments()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-50 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                    <button
                        onClick={() => setIsInvoiceModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Fatura
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryStats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="glass-card p-5"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? 'text-success-dark dark:text-green-400' : 'text-warning-dark dark:text-amber-400'}`}>
                                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-xl font-bold text-surface-900 dark:text-surface-50">{stat.value}</p>
                        <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Pesquisar referência, descrição ou tutor..."
                            icon={<Search className="w-4 h-4" />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['', 'COMPLETED', 'PENDING', 'FAILED'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${statusFilter === s
                                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800'
                                    : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 border border-transparent'
                                    }`}
                            >
                                {s === '' ? 'Todos' : statusConfig[s]?.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-100 dark:border-surface-800">
                                {['Referência', 'Descrição', 'Método', 'Valor', 'Estado', 'Data'].map((h) => (
                                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((payment, i) => {
                                const method = methodIcons[payment.method];
                                const status = statusConfig[payment.status];
                                const StatusIcon = status.icon;

                                return (
                                    <motion.tr
                                        key={payment.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="border-b border-surface-50 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-mono font-medium text-primary-600 dark:text-primary-400">
                                                {payment.reference}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-surface-700 dark:text-surface-300">{payment.description}</p>
                                            <p className="text-xs text-surface-500">{payment.tutor}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                                                {method && <method.icon className="w-4 h-4" />}
                                                <span>{method?.label || payment.method}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                                                {formatKwanza(payment.amount)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`badge ${status.badge}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-surface-500">
                                                {new Date(payment.date).toLocaleDateString('pt-AO')}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Invoice Modal */}
            <InvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                onSubmit={handleCreateInvoice}
            />
        </div>
    );
}
