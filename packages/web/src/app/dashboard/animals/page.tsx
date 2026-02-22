'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dog,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Syringe,
    FileText,
    Heart,
    X,
    Download,
} from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { SPECIES, DOG_BREEDS, CAT_BREEDS } from '@vetsaas/shared';
import AnimalModal from '@/components/animals/AnimalModal';
import type { AnimalFormData } from '@/components/animals/AnimalModal';
import '@/components/tutors/TutorModal.css'; // shared modal styles
import { exportApi } from '@/lib/services';

// Mock data for scaffold
const mockAnimals = [
    {
        id: '1', name: 'Rex', species: 'CANINE', breed: 'Pastor Alemão', sex: 'MALE',
        weight: 32, weightUnit: 'kg', microchipId: '900118000123456', isNeutered: true,
        dateOfBirth: '2020-03-15', tutorName: 'João Silva', tutorPhone: '+244 923 456 789',
        photoUrl: null, isDeceased: false, vaccinesUpToDate: true,
    },
    {
        id: '2', name: 'Mimi', species: 'FELINE', breed: 'Persa', sex: 'FEMALE',
        weight: 4.2, weightUnit: 'kg', microchipId: '900118000654321', isNeutered: true,
        dateOfBirth: '2019-07-22', tutorName: 'Ana Santos', tutorPhone: '+244 912 345 678',
        photoUrl: null, isDeceased: false, vaccinesUpToDate: false,
    },
    {
        id: '3', name: 'Thor', species: 'CANINE', breed: 'Rottweiler', sex: 'MALE',
        weight: 45, weightUnit: 'kg', microchipId: null, isNeutered: false,
        dateOfBirth: '2021-11-08', tutorName: 'Pedro Lopes', tutorPhone: '+244 933 678 901',
        photoUrl: null, isDeceased: false, vaccinesUpToDate: true,
    },
    {
        id: '4', name: 'Luna', species: 'FELINE', breed: 'SRD', sex: 'FEMALE',
        weight: 3.8, weightUnit: 'kg', microchipId: null, isNeutered: false,
        dateOfBirth: '2022-01-30', tutorName: 'Maria Fernandes', tutorPhone: '+244 944 321 654',
        photoUrl: null, isDeceased: false, vaccinesUpToDate: true,
    },
    {
        id: '5', name: 'Bolt', species: 'CANINE', breed: 'Labrador Retriever', sex: 'MALE',
        weight: 28, weightUnit: 'kg', microchipId: '900118000789012', isNeutered: true,
        dateOfBirth: '2018-05-12', tutorName: 'Carlos Neto', tutorPhone: '+244 955 432 765',
        photoUrl: null, isDeceased: false, vaccinesUpToDate: false,
    },
    {
        id: '6', name: 'Princesa', species: 'CANINE', breed: 'Poodle', sex: 'FEMALE',
        weight: 6.5, weightUnit: 'kg', microchipId: null, isNeutered: true,
        dateOfBirth: '2021-09-03', tutorName: 'Luísa Mendes', tutorPhone: '+244 966 543 876',
        photoUrl: null, isDeceased: false, vaccinesUpToDate: true,
    },
];

const speciesEmoji: Record<string, string> = {
    CANINE: '🐕', FELINE: '🐈', EQUINE: '🐴', BOVINE: '🐄', AVIAN: '🐦',
    REPTILE: '🦎', EXOTIC: '🦜', OTHER: '🐾',
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function AnimalsPage() {
    const [search, setSearch] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);

    const handleCreateAnimal = (_data: AnimalFormData) => {
        // TODO: POST to /animals API
    };

    const filtered = mockAnimals.filter((a) => {
        const matchesSearch =
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.tutorName.toLowerCase().includes(search.toLowerCase()) ||
            a.breed.toLowerCase().includes(search.toLowerCase()) ||
            (a.microchipId && a.microchipId.includes(search));
        const matchesSpecies = !speciesFilter || a.species === speciesFilter;
        return matchesSearch && matchesSpecies;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                            <Dog className="w-5 h-5 text-white" />
                        </div>
                        Pacientes
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        {filtered.length} pacientes registados
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        icon={<Download className="w-4 h-4" />}
                        onClick={() => exportApi.downloadAnimals()}
                    >
                        Exportar CSV
                    </Button>
                    <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Novo Paciente
                    </Button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Pesquisar por nome, tutor, raça ou microchip..."
                            icon={<Search className="w-4 h-4" />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        options={[
                            { value: '', label: 'Todas as espécies' },
                            ...SPECIES.map((s) => ({ value: s.code, label: `${s.icon} ${s.label}` })),
                        ]}
                        value={speciesFilter}
                        onChange={(e) => setSpeciesFilter(e.target.value)}
                        className="sm:w-56"
                    />
                </div>
            </div>

            {/* Animals Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-100 dark:border-surface-800">
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                    Paciente
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                    Espécie / Raça
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                    Tutor
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                    Peso
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="text-right px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                    Acções
                                </th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filtered.map((animal) => (
                                <motion.tr
                                    key={animal.id}
                                    variants={rowVariants}
                                    className="border-b border-surface-50 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors cursor-pointer group"
                                    onClick={() => setSelectedAnimal(animal.id)}
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center text-lg">
                                                {speciesEmoji[animal.species] || '🐾'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                                                    {animal.name}
                                                </p>
                                                <p className="text-xs text-surface-500">
                                                    {animal.sex === 'MALE' ? '♂ Macho' : '♀ Fêmea'}
                                                    {animal.isNeutered && ' • Castrado'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-surface-700 dark:text-surface-300">
                                            {SPECIES.find((s) => s.code === animal.species)?.label || animal.species}
                                        </p>
                                        <p className="text-xs text-surface-500">{animal.breed}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-surface-700 dark:text-surface-300">
                                            {animal.tutorName}
                                        </p>
                                        <p className="text-xs text-surface-500 font-mono">
                                            {animal.tutorPhone}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                                            {animal.weight} {animal.weightUnit}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            {animal.vaccinesUpToDate ? (
                                                <span className="badge badge-success">
                                                    <Syringe className="w-3 h-3" /> Vacinas OK
                                                </span>
                                            ) : (
                                                <span className="badge badge-warning">
                                                    <Syringe className="w-3 h-3" /> Vacina pendente
                                                </span>
                                            )}
                                            {animal.microchipId && (
                                                <span className="badge bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
                                                    Chip
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                                title="Ver detalhes"
                                                onClick={(e) => { e.stopPropagation(); }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors"
                                                title="Prontuário"
                                                onClick={(e) => { e.stopPropagation(); }}
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-danger hover:bg-danger-light dark:hover:bg-danger/20 transition-colors"
                                                title="Eliminar"
                                                onClick={(e) => { e.stopPropagation(); }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16">
                        <Dog className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                        <p className="text-surface-500 dark:text-surface-400 font-medium">
                            Nenhum paciente encontrado
                        </p>
                        <p className="text-sm text-surface-400 mt-1">
                            Tente ajustar os filtros ou adicione um novo paciente.
                        </p>
                    </div>
                )}
            </div>

            {/* Create Animal Modal */}
            <AnimalModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateAnimal}
            />
        </div>
    );
}
