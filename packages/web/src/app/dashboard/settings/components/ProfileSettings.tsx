'use client';

import { useState, useEffect } from 'react';
import { UserCircle, Loader2, Save, Check } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api-client';
import { toast } from '@/components/ui/Toast';

export default function ProfileSettings() {
    const { user } = useAuthStore();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const saveProfile = async () => {
        setProfileSaving(true);
        try {
            await api.patch('/auth/profile', { firstName, lastName, phone });
            toast('Perfil atualizado com sucesso!', 'success');
        } catch {
            toast('Erro ao guardar perfil.', 'error');
        } finally {
            setProfileSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-5 flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-primary-500" />
                    Informações Pessoais
                </h2>

                {/* Avatar */}
                <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {firstName?.[0]}{lastName?.[0]}
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                            {firstName} {lastName}
                        </p>
                        <p className="text-sm text-surface-500">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                            {user?.role === 'CLINIC_ADMIN' ? 'Administrador' : user?.role}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome"
                            value={firstName}
                            onChange={(e: any) => setFirstName(e.target.value)}
                        />
                        <Input
                            label="Apelido"
                            value={lastName}
                            onChange={(e: any) => setLastName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Email"
                            value={user?.email || ''}
                            disabled
                            hint="O email não pode ser alterado"
                        />
                        <Input
                            label="Telefone"
                            value={phone}
                            onChange={(e: any) => setPhone(e.target.value)}
                            placeholder="+244 9XX XXX XXX"
                        />
                    </div>
                </div>

                {profileMsg && (
                    <div className={`mt-4 flex items-center gap-2 text-sm ${profileMsg.includes('Erro') ? 'text-danger' : 'text-emerald-500'}`}>
                        <Check className="w-4 h-4" />
                        {profileMsg}
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <Button
                    icon={profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    onClick={saveProfile}
                    disabled={profileSaving}
                >
                    {profileSaving ? 'A guardar...' : 'Guardar Perfil'}
                </Button>
            </div>
        </div>
    );
}
