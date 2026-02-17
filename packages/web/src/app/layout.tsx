import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import '@/styles/globals.css';

const ToastContainer = dynamic(
    () => import('@/components/ui/Toast').then((m) => ({ default: m.ToastContainer })),
    { ssr: false },
);

export const viewport: Viewport = {
    themeColor: '#6366f1',
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: 'VetSaaS Angola — Plataforma Veterinária Premium',
    description:
        'Plataforma SaaS premium para clínicas veterinárias em Angola. Prontuário eletrônico, agendamento, pagamentos locais e muito mais.',
    keywords: [
        'veterinário',
        'Angola',
        'clínica veterinária',
        'SaaS',
        'prontuário eletrônico',
        'agendamento',
    ],
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'VetSaaS',
    },
    openGraph: {
        type: 'website',
        locale: 'pt_AO',
        siteName: 'VetSaaS Angola',
        title: 'VetSaaS Angola — Plataforma Veterinária Premium',
        description:
            'Prontuário eletrônico, agendamento inteligente e pagamentos locais para clínicas veterinárias em Angola.',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-AO" suppressHydrationWarning>
            <body className="min-h-screen antialiased">
                {children}
                <ToastContainer />
            </body>
        </html>
    );
}
