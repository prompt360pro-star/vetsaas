'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
    Settings,
    Building2,
    Shield,
    Bell,
    Users,
    UserCircle,
    Loader2,
} from 'lucide-react';

const ProfileSettings = dynamic(() => import('./components/ProfileSettings'), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
});
const ClinicSettings = dynamic(() => import('./components/ClinicSettings'), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
});
const UsersSettings = dynamic(() => import('./components/UsersSettings'), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
});
const SecuritySettings = dynamic(() => import('./components/SecuritySettings'), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
});
const NotificationSettings = dynamic(() => import('./components/NotificationSettings'), {
    loading: () => <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
});

const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: UserCircle },
    { id: 'clinic', label: 'Clínica', icon: Building2 },
    { id: 'users', label: 'Utilizadores', icon: Users },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-surface-500 to-surface-600 flex items-center justify-center shadow-lg">
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                    Configurações
                </h1>
                <p className="text-surface-500 dark:text-surface-400 mt-1">
                    Gerir as configurações da sua clínica
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all flex-1 justify-center whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm'
                            : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
            >
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'clinic' && <ClinicSettings />}
                {activeTab === 'users' && <UsersSettings />}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'notifications' && <NotificationSettings />}
            </motion.div>
        </div>
    );
}
