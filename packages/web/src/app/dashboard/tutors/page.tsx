'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    Phone,
    Mail,
    MapPin,
    FileCheck,
    MoreVertical,
    Eye,
    Edit,
    Dog,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { ANGOLA_PROVINCES } from '@vetsaas/shared';
import TutorModal from '@/components/tutors/TutorModal';
import type { TutorFormData } from '@/components/tutors/TutorModal';
import '@/components/tutors/TutorModal.css';

const mockTutors = [
    {
        id: '1', firstName: 'João', lastName: 'Silva', email: 'joao.silva@email.ao',
        phone: '+244 923 456 789', province: 'Luanda', city: 'Luanda',
        documentType: 'BI', documentNumber: '123456789LA001',
        animalCount: 2, animals: ['Rex', 'Bolt'], consentsGranted: 3,
        isActive: true, createdAt: '2024-03-15',
    },
    {
        id: '2', firstName: 'Ana', lastName: 'Santos', email: 'ana.santos@gmail.com',
        phone: '+244 912 345 678', province: 'Luanda', city: 'Viana',
        documentType: 'BI', documentNumber: '987654321LA002',
        animalCount: 1, animals: ['Mimi'], consentsGranted: 2,
        isActive: true, createdAt: '2024-05-20',
    },
    {
        id: '3', firstName: 'Pedro', lastName: 'Lopes', email: null,
        phone: '+244 933 678 901', province: 'Benguela', city: 'Benguela',
        documentType: 'BI', documentNumber: '456789123BG001',
        animalCount: 1, animals: ['Thor'], consentsGranted: 3,
        isActive: true, createdAt: '2024-06-10',
    },
    {
        id: '4', firstName: 'Maria', lastName: 'Fernandes', email: 'maria.f@email.ao',
        phone: '+244 944 321 654', province: 'Luanda', city: 'Talatona',
        documentType: 'PASSPORT', documentNumber: 'N123456',
        animalCount: 1, animals: ['Luna'], consentsGranted: 1,
        isActive: true, createdAt: '2024-08-02',
    },
    {
        id: '5', firstName: 'Carlos', lastName: 'Neto', email: 'cneto@empresa.ao',
        phone: '+244 955 432 765', province: 'Huambo', city: 'Huambo',
        documentType: 'BI', documentNumber: '789012345HB001',
        animalCount: 1, animals: ['Bolt'], consentsGranted: 3,
        isActive: true, createdAt: '2024-09-15',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function TutorsPage() {
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const handleCreateTutor = (_data: TutorFormData) => {
        // TODO: POST to /tutors API
    };

    const filtered = mockTutors.filter(
        (t) =>
            `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
            t.phone.includes(search) ||
            t.email?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        Tutores
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        {filtered.length} tutores registados
                    </p>
                </div>
                <Button
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsCreateOpen(true)}
                >
                    Novo Tutor
                </Button>
            </div>

            {/* Search */}
            <div className="glass-card p-4">
                <Input
                    placeholder="Pesquisar por nome, telefone ou email..."
                    icon={<Search className="w-4 h-4" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Tutors Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
                {filtered.map((tutor) => (
                    <motion.div
                        key={tutor.id}
                        variants={cardVariants}
                        className="glass-card p-5 hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {tutor.firstName[0]}{tutor.lastName[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-surface-900 dark:text-surface-50">
                                        {tutor.firstName} {tutor.lastName}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-surface-500">
                                        <MapPin className="w-3 h-3" />
                                        {tutor.city}, {tutor.province}
                                    </div>
                                </div>
                            </div>
                            <button aria-label="Opções" className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 opacity-0 group-hover:opacity-100 transition-all">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2.5 mb-4">
                            <div className="flex items-center gap-2.5 text-sm text-surface-600 dark:text-surface-400">
                                <Phone className="w-4 h-4 text-surface-400" />
                                <span className="font-mono text-xs">{tutor.phone}</span>
                            </div>
                            {tutor.email && (
                                <div className="flex items-center gap-2.5 text-sm text-surface-600 dark:text-surface-400">
                                    <Mail className="w-4 h-4 text-surface-400" />
                                    <span className="truncate text-xs">{tutor.email}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2.5 text-sm text-surface-600 dark:text-surface-400">
                                <FileCheck className="w-4 h-4 text-surface-400" />
                                <span className="text-xs">{tutor.documentType}: {tutor.documentNumber}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-800">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-2 py-1 rounded-lg">
                                    <Dog className="w-3.5 h-3.5" />
                                    {tutor.animalCount} {tutor.animalCount === 1 ? 'animal' : 'animais'}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {tutor.consentsGranted >= 3 ? (
                                    <span className="badge badge-success text-2xs">Consentimentos OK</span>
                                ) : (
                                    <span className="badge badge-warning text-2xs">Consentimentos pendentes</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Create Tutor Modal */}
            <TutorModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateTutor}
            />
        </div>
    );
}
