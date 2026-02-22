'use client';

import { Bell } from 'lucide-react';

export default function NotificationSettings() {
    return (
        <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-5 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Preferências de Notificação
            </h2>
            <div className="space-y-4">
                {[
                    { label: 'Lembrete de consulta (SMS)', desc: 'Enviar SMS ao tutor 24h antes', enabled: true },
                    { label: 'Vacinas vencidas', desc: 'Alertar quando vacinas estiverem por vencer', enabled: true },
                    { label: 'Pagamentos pendentes', desc: 'Notificar sobre faturas pendentes', enabled: true },
                    { label: 'Estoque baixo', desc: 'Alertar quando produtos chegarem ao mínimo', enabled: false },
                    { label: 'Relatórios semanais', desc: 'Enviar resumo por email toda segunda', enabled: false },
                ].map((n) => (
                    <div key={n.label} className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                        <div>
                            <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{n.label}</p>
                            <p className="text-xs text-surface-500 mt-0.5">{n.desc}</p>
                        </div>
                        <button
                            aria-label={`Alternar ${n.label}`}
                            className={`relative w-11 h-6 rounded-full transition-colors ${n.enabled ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-600'
                                }`}
                        >
                            <span
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${n.enabled ? 'left-6' : 'left-1'
                                    }`}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
