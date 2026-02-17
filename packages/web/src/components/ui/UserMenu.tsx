'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, UserCircle, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar } from './Avatar';
import { useClickOutside } from '@/lib/hooks/useClickOutside';

export function UserMenu() {
    const { user, logout } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
                <Avatar name={fullName || undefined} size="sm" status="online" />
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300 hidden sm:block">
                    {user?.firstName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 glass-card shadow-xl py-1 z-50"
                    >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                            <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                        </div>

                        {/* Links */}
                        <div className="py-1">
                            <Link
                                href="/dashboard/settings"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                            >
                                <UserCircle className="w-4 h-4" />
                                Meu Perfil
                            </Link>
                            <Link
                                href="/dashboard/settings"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Configurações
                            </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-surface-200 dark:border-surface-700 py-1">
                            <button
                                onClick={() => { setIsOpen(false); logout(); }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Terminar Sessão
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
