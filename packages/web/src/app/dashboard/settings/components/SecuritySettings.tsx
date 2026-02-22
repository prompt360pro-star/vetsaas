'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff, Check, Loader2, Database } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { api } from '@/lib/api-client';
import { toast } from '@/components/ui/Toast';

export default function SecuritySettings() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPw, setShowOldPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState('');
    const [pwError, setPwError] = useState('');

    const changePassword = async () => {
        setPwError('');
        setPwMsg('');
        if (newPassword.length < 8) {
            setPwError('A nova palavra-passe deve ter pelo menos 8 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwError('As palavras-passe não coincidem.');
            return;
        }
        setPwSaving(true);
        try {
            await api.post('/auth/change-password', { oldPassword, newPassword });
            toast('Palavra-passe alterada com sucesso!', 'success');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            toast('Palavra-passe atual incorreta.', 'error');
        } finally {
            setPwSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Password Change */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-5 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Alterar Palavra-passe
                </h2>
                <div className="space-y-4 max-w-md">
                    <div className="relative">
                        <Input
                            label="Palavra-passe atual"
                            type={showOldPw ? 'text' : 'password'}
                            value={oldPassword}
                            onChange={(e: any) => setOldPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowOldPw(!showOldPw)}
                            className="absolute right-3 top-9 text-surface-400 hover:text-surface-600"
                            aria-label="Mostrar palavra-passe"
                        >
                            {showOldPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="relative">
                        <Input
                            label="Nova palavra-passe"
                            type={showNewPw ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e: any) => setNewPassword(e.target.value)}
                            hint="Mínimo 8 caracteres"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPw(!showNewPw)}
                            className="absolute right-3 top-9 text-surface-400 hover:text-surface-600"
                            aria-label="Mostrar nova palavra-passe"
                        >
                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <Input
                        label="Confirmar nova palavra-passe"
                        type="password"
                        value={confirmPassword}
                        onChange={(e: any) => setConfirmPassword(e.target.value)}
                        error={pwError || undefined}
                    />
                    {pwMsg && (
                        <div className="flex items-center gap-2 text-sm text-emerald-500">
                            <Check className="w-4 h-4" />
                            {pwMsg}
                        </div>
                    )}
                    <Button
                        icon={pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                        onClick={changePassword}
                        disabled={pwSaving || !oldPassword || !newPassword || !confirmPassword}
                    >
                        {pwSaving ? 'A alterar...' : 'Alterar Palavra-passe'}
                    </Button>
                </div>
            </div>

            {/* Auth settings */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-5 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Autenticação
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                        <div>
                            <p className="text-sm font-medium text-surface-900 dark:text-surface-50">Autenticação Multifactor (MFA)</p>
                            <p className="text-xs text-surface-500 mt-0.5">Adicione uma camada extra de segurança</p>
                        </div>
                        <button aria-label="Activar MFA" className="relative w-11 h-6 bg-surface-300 dark:bg-surface-600 rounded-full transition-colors">
                            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                        <div>
                            <p className="text-sm font-medium text-surface-900 dark:text-surface-50">Sessão Automática (Timeout)</p>
                            <p className="text-xs text-surface-500 mt-0.5">Encerrar sessão após inatividade</p>
                        </div>
                        <Select
                            options={[
                                { value: '15', label: '15 minutos' },
                                { value: '30', label: '30 minutos' },
                                { value: '60', label: '1 hora' },
                                { value: '240', label: '4 horas' },
                            ]}
                            className="w-40"
                        />
                    </div>
                </div>
            </div>

            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-500" />
                    Lei n.º 22/11 — Protecção de Dados
                </h2>
                <p className="text-sm text-surface-500 mb-4">
                    Gestão de consentimentos e conformidade com a lei angolana de protecção de dados pessoais.
                </p>
                <div className="flex items-center gap-3 text-sm">
                    <span className="badge badge-success"><Check className="w-3 h-3" /> Logs de auditoria activos</span>
                    <span className="badge badge-success"><Check className="w-3 h-3" /> Consentimentos rastreados</span>
                    <span className="badge badge-success"><Check className="w-3 h-3" /> Dados encriptados</span>
                </div>
            </div>
        </div>
    );
}
