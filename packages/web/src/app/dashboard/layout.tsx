'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PawPrint,
    LayoutDashboard,
    Dog,
    Users,
    Calendar,
    FileText,
    CreditCard,
    Package,
    Settings,
    Shield,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { SearchBar } from '@/components/ui/SearchBar';
import { UserMenu } from '@/components/ui/UserMenu';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationCenter } from '@/components/ui/NotificationCenter';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useApi } from '@/lib/hooks/use-api';
import { alertsApi } from '@/lib/services';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/animals', icon: Dog, label: 'Pacientes' },
    { href: '/dashboard/tutors', icon: Users, label: 'Tutores' },
    { href: '/dashboard/appointments', icon: Calendar, label: 'Agenda' },
    { href: '/dashboard/records', icon: FileText, label: 'Prontuários' },
    { href: '/dashboard/payments', icon: CreditCard, label: 'Financeiro' },
    { href: '/dashboard/inventory', icon: Package, label: 'Inventário' },
    { href: '/dashboard/audit', icon: Shield, label: 'Auditoria' },
    { href: '/dashboard/reports', icon: BarChart3, label: 'Relatórios' },
    { href: '/dashboard/settings', icon: Settings, label: 'Configurações' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { data: alerts } = useApi(() => alertsApi.fetchAlerts());
    const alertCount = alerts?.length ?? 0;

    return (
        <div className="flex h-screen bg-surface-100 dark:bg-surface-950">
            <CommandPalette />
            <KeyboardShortcutsHelp />
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 80 : 260 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="relative flex flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 overflow-hidden"
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-6 border-b border-surface-100 dark:border-surface-800">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
                        <PawPrint className="w-5 h-5 text-white" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-lg font-bold text-surface-900 dark:text-surface-50 whitespace-nowrap overflow-hidden"
                            >
                                Vet<span className="text-gradient">SaaS</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === '/dashboard'
                                ? pathname === '/dashboard'
                                : pathname.startsWith(item.href);

                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative group ${isActive
                                        ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400'
                                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                                        }`}
                                    whileHover={{ x: 2 }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon
                                        className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''
                                            }`}
                                    />
                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="text-sm font-medium whitespace-nowrap overflow-hidden"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="border-t border-surface-100 dark:border-surface-800 p-3">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {user?.firstName?.[0]}
                            {user?.lastName?.[0]}
                        </div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex-1 min-w-0 overflow-hidden"
                                >
                                    <p className="text-sm font-medium text-surface-900 dark:text-surface-50 truncate">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-surface-500 truncate">
                                        {user?.role === 'CLINIC_ADMIN' ? 'Administrador' : user?.role}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute top-6 -right-3 w-6 h-6 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full flex items-center justify-center text-surface-500 hover:text-primary-600 shadow-sm z-20 transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                </button>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="h-16 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4 flex-1 max-w-lg">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden w-9 h-9 rounded-xl bg-surface-50 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:text-primary-600 transition-colors"
                            aria-label="Abrir menu"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                        <SearchBar />
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <NotificationCenter />

                        <UserMenu />
                    </div>
                </header>

                {/* Breadcrumbs */}
                <Breadcrumbs />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </motion.div>
                </main>
            </div>

            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 z-50 md:hidden flex flex-col"
                        >
                            <div className="h-16 flex items-center justify-between px-5 border-b border-surface-200 dark:border-surface-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow">
                                        <PawPrint className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-lg font-bold text-surface-900 dark:text-surface-50">
                                        Vet<span className="text-gradient">SaaS</span>
                                    </span>
                                </div>
                                <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="text-surface-400 hover:text-surface-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                                ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400'
                                                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
