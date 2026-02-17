'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Building2,
    Globe,
    Shield,
    Bell,
    Users,
    Database,
    Save,
    Check,
    Eye,
    EyeOff,
    UserCircle,
    Loader2,
} from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { ANGOLA_PROVINCES } from '@vetsaas/shared';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api-client';
import { toast } from '@/components/ui/Toast';

const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: UserCircle },
    { id: 'clinic', label: 'Clínica', icon: Building2 },
    { id: 'users', label: 'Utilizadores', icon: Users },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
];

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');

    // Password form
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPw, setShowOldPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState('');
    const [pwError, setPwError] = useState('');

    // Init profile from store
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
                {/* ─── Profile Tab ──────────────────────────────────────── */}
                {activeTab === 'profile' && (
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
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                    <Input
                                        label="Apelido"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
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
                                        onChange={(e) => setPhone(e.target.value)}
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
                )}

                {/* ─── Clinic Tab ──────────────────────────────────────── */}
                {activeTab === 'clinic' && (
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-5 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary-500" />
                                Dados da Clínica
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="Nome da Clínica" placeholder="Clínica Veterinária Angola" />
                                    <Input label="NIF" placeholder="5417XXXXXXX" hint="Contribuinte fiscal" />
                                </div>
                                <Input label="Email" type="email" placeholder="info@clinica.ao" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="Telefone" placeholder="+244 2XX XXX XXX" />
                                    <Input label="Website" placeholder="www.clinica.ao" />
                                </div>
                                <Input label="Morada" placeholder="Rua, número, bairro" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="Cidade" placeholder="Luanda" />
                                    <Select
                                        label="Província"
                                        placeholder="Selecionar"
                                        options={ANGOLA_PROVINCES.map((p) => ({ value: p, label: p }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-5 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-accent-500" />
                                Preferências Regionais
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Select
                                    label="Moeda"
                                    options={[
                                        { value: 'AOA', label: 'Kwanza (AOA)' },
                                        { value: 'USD', label: 'Dólar (USD)' },
                                    ]}
                                />
                                <Select
                                    label="Fuso Horário"
                                    options={[{ value: 'Africa/Luanda', label: 'Africa/Luanda (WAT)' }]}
                                />
                                <Select
                                    label="Idioma"
                                    options={[
                                        { value: 'pt-AO', label: 'Português (Angola)' },
                                        { value: 'en', label: 'English' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button icon={<Save className="w-4 h-4" />}>Guardar Alterações</Button>
                        </div>
                    </div>
                )}

                {/* ─── Users Tab ───────────────────────────────────────── */}
                {activeTab === 'users' && (
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
                )}

                {/* ─── Security Tab ────────────────────────────────────── */}
                {activeTab === 'security' && (
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
                                        onChange={(e) => setOldPassword(e.target.value)}
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
                                        onChange={(e) => setNewPassword(e.target.value)}
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
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                )}

                {/* ─── Notifications Tab ───────────────────────────────── */}
                {activeTab === 'notifications' && (
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
                )}
            </motion.div>
        </div>
    );
}
