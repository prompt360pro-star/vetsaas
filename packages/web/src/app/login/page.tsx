'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PawPrint, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Credenciais inválidas');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left — Decorative Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 p-12 items-end">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-32 right-16 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
                            className="w-[500px] h-[500px] border border-white/10 rounded-full"
                        />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                            <PawPrint className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">VetSaaS</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                        Cuidar de animais,
                        <br />
                        simplificado.
                    </h2>
                    <p className="text-white/70 text-lg max-w-md">
                        Plataforma completa para gestão da sua clínica veterinária
                        em Angola.
                    </p>
                </motion.div>
            </div>

            {/* Right — Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-surface-50 dark:bg-surface-950">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow">
                            <PawPrint className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-surface-900 dark:text-surface-50">
                            Vet<span className="text-gradient">SaaS</span>
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-2">
                        Bem-vindo de volta
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mb-10">
                        Insira suas credenciais para aceder à plataforma.
                    </p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 p-4 rounded-xl bg-danger-light dark:bg-danger/20 border border-danger/20 text-danger-dark dark:text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="input-premium pl-12"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-premium pl-12 pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-sm text-surface-600 dark:text-surface-400">
                                    Lembrar-me
                                </span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Entrar
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <p className="mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
                        Ainda não tem conta?{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-primary-600 hover:text-primary-700"
                        >
                            Criar conta gratuita
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
