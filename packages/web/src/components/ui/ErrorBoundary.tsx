'use client';

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/* ── Types ───────────────────────────────────────── */

interface ErrorBoundaryProps {
    children: React.ReactNode;
    /** Optional fallback component */
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/* ── Component ───────────────────────────────────── */

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
        }

        return this.props.children;
    }
}

/* ── Default Fallback ────────────────────────────── */

function ErrorFallback({
    error,
    onReset,
}: {
    error: Error | null;
    onReset: () => void;
}) {
    return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center"
            >
                {/* Icon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-danger" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-2">
                    Algo correu mal
                </h2>
                <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">
                    Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
                </p>

                {/* Error details (dev only) */}
                {error && process.env.NODE_ENV === 'development' && (
                    <details className="mb-6 text-left">
                        <summary className="flex items-center gap-2 cursor-pointer text-xs text-surface-400 hover:text-surface-600 transition-colors">
                            <Bug className="w-3.5 h-3.5" />
                            Detalhes do erro
                        </summary>
                        <pre className="mt-2 p-3 rounded-xl bg-surface-100 dark:bg-surface-800 text-xs text-surface-600 dark:text-surface-400 overflow-x-auto whitespace-pre-wrap break-words">
                            {error.message}
                            {error.stack && `\n\n${error.stack}`}
                        </pre>
                    </details>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Tentar novamente
                    </button>
                    <a
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Dashboard
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
