'use client';

import { useState, useEffect } from 'react';
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
import { toast } from '@/components/ui/Toast';
import { SPECIES, DOG_BREEDS, CAT_BREEDS } from '@vetsaas/shared';
import type { CreateAnimalDto, AnimalSex } from '@vetsaas/shared';
import AnimalModal from '@/components/animals/AnimalModal';
import type { AnimalFormData } from '@/components/animals/AnimalModal';
import '@/components/tutors/TutorModal.css'; // shared modal styles
import { exportApi, animalsApi } from '@/lib/services';
import type { Animal } from '@/lib/services/animals.api';

const speciesEmoji: Record<string, string> = {
    CANINE: '🐕', FELINE: '🐈', EQUINE: '🐴', BOVINE: '🐄', AVIAN: '🐦',
    REPTILE: '🦎', EXOTIC: '🦜', OTHER: '🐾',
};

// Interface for display - matches mockAnimals structure
interface AnimalDisplay {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    sex: string;
    weight: number | null;
    weightUnit: string;
    microchipId: string | null;
    isNeutered: boolean;
    dateOfBirth: string | null;
    tutorName: string;
    tutorPhone: string;
    photoUrl: string | null;
    isDeceased: boolean;
    vaccinesUpToDate: boolean;
}

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
    const [animals, setAnimals] = useState<AnimalDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnimals = async () => {
        try {
            setIsLoading(true);
            const response = await animalsApi.getAll();
            if (response.success && response.data) {
                const mappedAnimals: AnimalDisplay[] = response.data.data.map((a: Animal) => ({
                    id: a.id,
                    name: a.name,
                    species: a.species,
                    breed: a.breed || null,
                    sex: a.sex,
                    weight: a.weight || null,
                    weightUnit: a.weightUnit,
                    microchipId: a.microchipId || null,
                    isNeutered: a.isNeutered,
                    dateOfBirth: a.dateOfBirth ? new Date(a.dateOfBirth).toISOString().split('T')[0] : null,
                    tutorName: 'N/A', // TODO: Fetch from relationship
                    tutorPhone: 'N/A',
                    photoUrl: a.photoUrl || null,
                    isDeceased: a.isDeceased,
                    vaccinesUpToDate: false, // TODO: Logic for vaccines
                }));
                setAnimals(mappedAnimals);
            }
        } catch (error) {
            console.error('Failed to fetch animals', error);
            toast('Erro ao carregar lista de animais', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnimals();
    }, []);

    const handleCreateAnimal = async (data: AnimalFormData) => {
        try {
            const payload: CreateAnimalDto = {
                name: data.name,
                species: data.species,
                breed: data.breed || undefined,
                sex: data.sex as AnimalSex,
                weight: data.weight || undefined,
                weightUnit: data.weightUnit as 'kg' | 'g',
                microchipId: data.microchipId || undefined,
                dateOfBirth: data.dateOfBirth || undefined,
                isNeutered: data.isNeutered,
            };

            await animalsApi.create(payload);
            toast('Animal criado com sucesso!', 'success');
            fetchAnimals();
        } catch (error) {
            console.error(error);
            toast('Erro ao criar animal.', 'error');
            throw error;
        }
    };

    const filtered = animals.filter((a) => {
        const matchesSearch =
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.tutorName.toLowerCase().includes(search.toLowerCase()) ||
            (a.breed && a.breed.toLowerCase().includes(search.toLowerCase())) ||
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
                        {isLoading ? (
                            <p className="text-surface-500 dark:text-surface-400 font-medium">Carregando...</p>
                        ) : (
                            <>
                                <Dog className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                                <p className="text-surface-500 dark:text-surface-400 font-medium">
                                    Nenhum paciente encontrado
                                </p>
                                <p className="text-sm text-surface-400 mt-1">
                                    Tente ajustar os filtros ou adicione um novo paciente.
                                </p>
                            </>
                        )}
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
