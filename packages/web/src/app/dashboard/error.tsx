'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 max-w-md w-full text-center"
            >
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>

                <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-2">
                    Algo correu mal
                </h2>
                <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">
                    Ocorreu um erro inesperado. Tente novamente ou contacte o suporte.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Tentar novamente
                    </button>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    >
                        {showDetails ? 'Ocultar' : 'Detalhes'}
                    </button>
                </div>

                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-left"
                    >
                        <p className="text-xs font-mono text-red-400 break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-surface-500 mt-1">
                                Digest: {error.digest}
                            </p>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
