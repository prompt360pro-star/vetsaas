import Link from 'next/link';
import { PawPrint } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-950 dark:to-surface-900 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                {/* Animated paw */}
                <div className="relative mx-auto w-32 h-32 mb-8">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 animate-ping" />
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
                        <PawPrint className="w-16 h-16 text-primary-500/60" />
                    </div>
                </div>

                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500 mb-4">
                    404
                </h1>
                <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-3">
                    Página não encontrada
                </h2>
                <p className="text-surface-500 dark:text-surface-400 mb-8">
                    A página que procura não existe ou foi movida. Verifique o endereço e tente novamente.
                </p>

                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all"
                >
                    <PawPrint className="w-4 h-4" />
                    Voltar ao Dashboard
                </Link>
            </div>
        </div>
    );
}
