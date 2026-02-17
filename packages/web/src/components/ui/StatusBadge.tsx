type StatusVariant =
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral';

interface StatusBadgeProps {
    label: string;
    variant?: StatusVariant;
    /** Auto-map common status strings to variants */
    status?: string;
    dot?: boolean;
}

const variantStyles: Record<StatusVariant, { bg: string; text: string; dot: string }> = {
    success: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
    warning: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    danger: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
    info: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
    neutral: { bg: 'bg-surface-500/10', text: 'text-surface-600 dark:text-surface-400', dot: 'bg-surface-500' },
};

const statusMap: Record<string, StatusVariant> = {
    // Payments
    paid: 'success',
    pago: 'success',
    pending: 'warning',
    pendente: 'warning',
    overdue: 'danger',
    vencido: 'danger',
    cancelled: 'danger',
    cancelado: 'danger',
    // Appointments
    scheduled: 'info',
    agendado: 'info',
    completed: 'success',
    concluido: 'success',
    'in-progress': 'warning',
    'em-progresso': 'warning',
    'no-show': 'danger',
    // General
    active: 'success',
    ativo: 'success',
    inactive: 'neutral',
    inativo: 'neutral',
};

export function StatusBadge({ label, variant, status, dot = true }: StatusBadgeProps) {
    const resolvedVariant = variant || (status ? statusMap[status.toLowerCase()] : undefined) || 'neutral';
    const styles = variantStyles[resolvedVariant];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
            {label}
        </span>
    );
}
