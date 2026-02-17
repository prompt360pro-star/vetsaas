'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Stethoscope,
    Shield,
    CreditCard,
    Smartphone,
    BarChart3,
    Brain,
    ChevronRight,
    PawPrint,
    Heart,
    Zap,
} from 'lucide-react';

const features = [
    {
        icon: Stethoscope,
        title: 'Prontuário Clínico Elite',
        description: 'SOAP, templates por especialidade, vacinas, alergias e assinaturas digitais.',
        color: 'from-primary-500 to-primary-600',
    },
    {
        icon: CreditCard,
        title: 'Pagamentos Locais',
        description: 'Multicaixa, Unitel Money, mPOS — tudo integrado nativamente.',
        color: 'from-accent-500 to-accent-600',
    },
    {
        icon: Shield,
        title: 'Segurança & Compliance',
        description: 'Lei n.º 22/11, encriptação ponta-a-ponta, RBAC, MFA, logs imutáveis.',
        color: 'from-blue-500 to-blue-600',
    },
    {
        icon: Smartphone,
        title: 'Mobile & Offline',
        description: 'Funciona em tablet e mobile, com suporte offline para áreas de baixa conectividade.',
        color: 'from-purple-500 to-purple-600',
    },
    {
        icon: BarChart3,
        title: 'Analytics & BI',
        description: 'Dashboards em tempo real, KPIs clínicos, previsão de demanda.',
        color: 'from-emerald-500 to-emerald-600',
    },
    {
        icon: Brain,
        title: 'IA Clínica',
        description: 'Transcrição automática, sugestões baseadas em ML, sempre com validação humana.',
        color: 'from-rose-500 to-rose-600',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            {/* Hero Section */}
            <header className="relative overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

                <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow">
                                <PawPrint className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-surface-900 dark:text-surface-50">
                                Vet<span className="text-gradient">SaaS</span>
                            </span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-primary-600 transition-colors"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/register"
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
                            >
                                Começar Grátis
                            </Link>
                        </motion.div>
                    </div>
                </nav>

                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800"
                        >
                            <Zap className="w-4 h-4 text-primary-600" />
                            <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                                Feito para Angola 🇦🇴
                            </span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50 leading-[1.1]">
                            A clínica veterinária do{' '}
                            <span className="text-gradient">futuro</span>
                            <br />
                            começa aqui.
                        </h1>

                        <p className="mt-8 text-lg md:text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
                            Plataforma SaaS completa para gestão de clínicas veterinárias.
                            Prontuário eletrônico, agendamento inteligente, pagamentos locais
                            e IA clínica — tudo num só lugar.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/register"
                                className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl hover:from-primary-600 hover:to-primary-700 shadow-xl shadow-primary-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/30 hover:-translate-y-1"
                            >
                                <Heart className="w-5 h-5" />
                                Começar Agora
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/demo"
                                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-surface-700 transition-all duration-200"
                            >
                                Ver Demonstração
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-24 px-6" id="features">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-surface-50">
                            Tudo o que sua clínica precisa
                        </h2>
                        <p className="mt-4 text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
                            Do prontuário à fatura, da agenda à IA — cada funcionalidade
                            desenhada para a realidade angolana.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((feature) => (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                className="group glass-card p-8 hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                <div
                                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-accent-600 p-12 md:p-16 text-center"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Pronto para transformar sua clínica?
                            </h2>
                            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                                Junte-se às clínicas veterinárias que estão liderando a
                                transformação digital em Angola.
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-primary-700 bg-white rounded-2xl hover:bg-primary-50 shadow-xl transition-all duration-200 hover:-translate-y-1"
                            >
                                Criar Conta Gratuita
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-surface-200 dark:border-surface-800 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                            <PawPrint className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-surface-700 dark:text-surface-300">
                            VetSaaS Angola
                        </span>
                    </div>
                    <p className="text-sm text-surface-500">
                        © {new Date().getFullYear()} VetSaaS Angola. Todos os direitos
                        reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
