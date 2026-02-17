'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';

const labelMap: Record<string, string> = {
    dashboard: 'Dashboard',
    animals: 'Pacientes',
    tutors: 'Tutores',
    records: 'Prontuários',
    appointments: 'Agenda',
    payments: 'Financeiro',
    inventory: 'Inventário',
    settings: 'Configurações',
    audit: 'Auditoria',
    reports: 'Relatórios',
};

export function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    // Don't show on dashboard root
    if (segments.length <= 1) return null;

    const crumbs = segments.map((seg, i) => ({
        label: labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
        href: '/' + segments.slice(0, i + 1).join('/'),
        isLast: i === segments.length - 1,
    }));

    return (
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-sm px-6 py-2.5 bg-surface-50/50 dark:bg-surface-900/50 border-b border-surface-200/50 dark:border-surface-800/50">
            <Link href="/dashboard" className="text-surface-400 hover:text-primary-500 transition-colors">
                <Home className="w-3.5 h-3.5" />
            </Link>
            {crumbs.map((crumb) => (
                <span key={crumb.href} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-surface-300 dark:text-surface-600" />
                    {crumb.isLast ? (
                        <span className="text-surface-700 dark:text-surface-300 font-medium">{crumb.label}</span>
                    ) : (
                        <Link href={crumb.href} className="text-surface-400 hover:text-primary-500 transition-colors">
                            {crumb.label}
                        </Link>
                    )}
                </span>
            ))}
        </nav>
    );
}
