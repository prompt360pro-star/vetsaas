'use client';

import { Users } from 'lucide-react';
import { Button } from '@/components/ui';

export default function UsersSettings() {
    return (
        <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-5 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Equipa
            </h2>
            <div className="space-y-3">
                {[
                    { name: 'Dr. António Silva', role: 'CLINIC_ADMIN', email: 'antonio@clinica.ao' },
                    { name: 'Dra. Sofia Mendes', role: 'VETERINARIAN', email: 'sofia@clinica.ao' },
                    { name: 'João Pereira', role: 'VET_TECH', email: 'joao.p@clinica.ao' },
                    { name: 'Maria Costa', role: 'RECEPTIONIST', email: 'maria.c@clinica.ao' },
                ].map((u) => (
                    <div key={u.email} className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-semibold text-sm">
                                {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{u.name}</p>
                                <p className="text-xs text-surface-500">{u.email}</p>
                            </div>
                        </div>
                        <span className="badge bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-xs">
                            {u.role === 'CLINIC_ADMIN' ? 'Admin' : u.role === 'VETERINARIAN' ? 'Veterinário' : u.role === 'VET_TECH' ? 'Técnico' : 'Recepção'}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <Button variant="secondary" icon={<Users className="w-4 h-4" />}>
                    Convidar Membro
                </Button>
            </div>
        </div>
    );
}
