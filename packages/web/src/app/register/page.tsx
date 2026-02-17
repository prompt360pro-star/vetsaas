'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    PawPrint,
    Mail,
    Lock,
    User,
    Building2,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    Check,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading } = useAuthStore();
    const [form, setForm] = useState({
        clinicName: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const updateField = (key: string, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await register(form);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
        }
    };

    const passwordStrength = (pw: string): { level: number; label: string } => {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        const labels = ['Fraca', 'Razoável', 'Boa', 'Forte', 'Excelente'];
        return { level: score, label: labels[score] || 'Fraca' };
    };

    const strength = passwordStrength(form.password);
    const strengthColors = ['bg-danger', 'bg-warning', 'bg-primary-400', 'bg-accent-500', 'bg-success'];

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50 dark:bg-surface-950">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-lg"
            >
                <div className="flex items-center gap-3 mb-10 justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow">
                        <PawPrint className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-surface-900 dark:text-surface-50">
                        Vet<span className="text-gradient">SaaS</span>
                    </span>
                </div>

                <div className="glass-card p-8 md:p-10">
                    <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2 text-center">
                        Criar sua clínica
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mb-8 text-center">
                        Registe-se e comece a transformar sua clínica.
                    </p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-6 p-4 rounded-xl bg-danger-light dark:bg-danger/20 border border-danger/20 text-danger-dark dark:text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                                Nome da Clínica
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    type="text"
                                    value={form.clinicName}
                                    onChange={(e) => updateField('clinicName', e.target.value)}
                                    placeholder="Clínica Veterinária Angola"
                                    className="input-premium pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                                    Nome
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                    <input
                                        type="text"
                                        value={form.firstName}
                                        onChange={(e) => updateField('firstName', e.target.value)}
                                        placeholder="João"
                                        className="input-premium pl-12"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                                    Apelido
                                </label>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => updateField('lastName', e.target.value)}
                                    placeholder="Silva"
                                    className="input-premium"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    placeholder="joao@clinica.ao"
                                    className="input-premium pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => updateField('password', e.target.value)}
                                    placeholder="Min. 8 caracteres"
                                    className="input-premium pl-12 pr-12"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[0, 1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-colors ${i < strength.level
                                                        ? strengthColors[strength.level]
                                                        : 'bg-surface-200 dark:bg-surface-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-surface-500">{strength.label}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-3 pt-2">
                            <input
                                type="checkbox"
                                required
                                className="mt-1 w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm text-surface-600 dark:text-surface-400">
                                Aceito os{' '}
                                <Link href="/terms" className="text-primary-600 hover:underline">
                                    Termos de Uso
                                </Link>{' '}
                                e a{' '}
                                <Link href="/privacy" className="text-primary-600 hover:underline">
                                    Política de Privacidade
                                </Link>{' '}
                                (Lei n.º 22/11).
                            </span>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200 disabled:opacity-50 mt-6"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Criar Conta
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
                    Já tem conta?{' '}
                    <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                        Entrar
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
