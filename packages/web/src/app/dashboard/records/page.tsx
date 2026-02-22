'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    Search,
    Clock,
    Dog,
    User,
    ChevronDown,
    ChevronRight,
    Shield,
    Thermometer,
    Heart,
    Activity,
    Weight,
    CheckCircle,
    Edit3,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import RecordModal from '@/components/records/RecordModal';
import type { RecordFormData } from '@/components/records/RecordModal';
import '@/components/tutors/TutorModal.css';
import { api } from '@/lib/api-client';
import { toast } from '@/components/ui/Toast';

interface VitalSigns {
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    weight: number;
    bodyConditionScore: number;
}

interface SOAPRecord {
    id: string;
    animalName: string;
    animalSpecies: string;
    tutorName: string;
    veterinarian: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    vitals: VitalSigns;
    isSigned: boolean;
    version: number;
    createdAt: string;
}

export default function RecordsPage() {
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [records, setRecords] = useState<SOAPRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRecords = async () => {
        try {
            setIsLoading(true);
            const res = await api.get<{ data: { data: any[] } }>('/records');
            const mapped = res.data.data.map((r: any) => ({
                id: r.id,
                animalName: r.animal?.name || 'Desconhecido',
                animalSpecies: r.animal?.species || '?',
                tutorName: 'N/A', // Tutor info not yet joined
                veterinarian: r.veterinarian ? `${r.veterinarian.firstName} ${r.veterinarian.lastName}` : 'N/A',
                subjective: r.subjective,
                objective: r.objective,
                assessment: r.assessment,
                plan: r.plan,
                vitals: r.vitals || {},
                isSigned: !!r.signedAt,
                version: r.version,
                createdAt: r.createdAt,
            }));
            setRecords(mapped);
        } catch (error) {
            console.error('Failed to fetch records', error);
            toast('Erro ao carregar prontuários.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleCreateRecord = async (data: RecordFormData) => {
        try {
            // 1. Search for animal
            const animalsRes = await api.get<{ data: { data: any[] } }>('/animals', { search: data.animalName });
            const animals = animalsRes.data.data;

            let animalId = '';

            if (animals.length === 0) {
                toast('Paciente não encontrado. Registe o animal primeiro.', 'error');
                return;
            } else if (animals.length === 1) {
                animalId = animals[0].id;
            } else {
                // Check for exact match
                const exact = animals.find((a: any) => a.name.toLowerCase() === data.animalName.toLowerCase());
                if (exact) {
                    animalId = exact.id;
                } else {
                    toast('Múltiplos pacientes encontrados. Seja mais específico.', 'warning');
                    return;
                }
            }

            // 2. Create record
            await api.post('/records', {
                animalId,
                subjective: data.subjective,
                objective: data.objective,
                assessment: data.assessment,
                plan: data.plan,
                vitals: {
                    temperature: data.temperature,
                    heartRate: data.heartRate,
                    respiratoryRate: data.respiratoryRate,
                    weight: data.weight,
                    bodyConditionScore: data.bodyConditionScore,
                },
            });

            toast('Prontuário criado com sucesso!', 'success');
            setIsCreateOpen(false);
            fetchRecords();
        } catch (error) {
            console.error(error);
            toast('Erro ao criar prontuário.', 'error');
        }
    };

    const filtered = records.filter(
        (r) =>
            r.animalName.toLowerCase().includes(search.toLowerCase()) ||
            r.tutorName.toLowerCase().includes(search.toLowerCase()) ||
            r.veterinarian.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        Prontuários Clínicos
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        Registos clínicos (SOAP) com versionamento
                    </p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>
                    Novo Prontuário
                </Button>
            </div>

            {/* Search */}
            <div className="glass-card p-4">
                <Input
                    placeholder="Pesquisar por animal, tutor ou veterinário..."
                    icon={<Search className="w-4 h-4" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Records Accordion */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="p-8 text-center text-surface-500">Carregando prontuários...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-surface-500">Nenhum prontuário encontrado.</div>
                ) : (
                    filtered.map((record, idx) => {
                        const isExpanded = expandedId === record.id;

                        return (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                className="glass-card overflow-hidden"
                            >
                                {/* Header — always visible */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-lg flex-shrink-0">
                                        {record.animalSpecies === 'Canine' || record.animalSpecies === 'Cão' ? '🐕' :
                                         record.animalSpecies === 'Feline' || record.animalSpecies === 'Gato' ? '🐈' :
                                         record.animalSpecies.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                                                {record.animalName}
                                            </p>
                                            <span className="text-xs text-surface-500">— {record.tutorName}</span>
                                            {record.isSigned ? (
                                                <span className="badge badge-success">
                                                    <Shield className="w-3 h-3" /> Assinado
                                                </span>
                                            ) : (
                                                <span className="badge badge-warning">
                                                    <Edit3 className="w-3 h-3" /> Rascunho
                                                </span>
                                            )}
                                            <span className="badge bg-surface-100 dark:bg-surface-800 text-surface-500 text-2xs">
                                                v{record.version}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-surface-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(record.createdAt).toLocaleDateString('pt-AO')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {record.veterinarian}
                                            </span>
                                        </div>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: isExpanded ? 90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronRight className="w-5 h-5 text-surface-400" />
                                    </motion.div>
                                </button>

                                {/* Expanded — SOAP + Vitals */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 space-y-5">
                                                {/* Vitals Strip */}
                                                <div className="flex flex-wrap gap-3">
                                                    {[
                                                        { icon: Thermometer, label: 'Temp', value: `${record.vitals.temperature}°C`, ok: record.vitals.temperature <= 39.5 },
                                                        { icon: Heart, label: 'FC', value: `${record.vitals.heartRate} bpm`, ok: true },
                                                        { icon: Activity, label: 'FR', value: `${record.vitals.respiratoryRate}/min`, ok: true },
                                                        { icon: Weight, label: 'Peso', value: `${record.vitals.weight} kg`, ok: true },
                                                    ].map((v) => (
                                                        <div
                                                            key={v.label}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${v.ok
                                                                ? 'bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300'
                                                                : 'bg-warning-light dark:bg-warning/10 text-warning-dark dark:text-amber-400'
                                                                }`}
                                                        >
                                                            <v.icon className="w-4 h-4" />
                                                            <span className="font-medium">{v.value}</span>
                                                            <span className="text-xs text-surface-400">{v.label}</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-800 text-sm">
                                                        <span className="font-medium">BCS {record.vitals.bodyConditionScore}/9</span>
                                                    </div>
                                                </div>

                                                {/* SOAP Sections */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {[
                                                        { letter: 'S', title: 'Subjectivo', content: record.subjective, color: 'border-l-blue-500' },
                                                        { letter: 'O', title: 'Objectivo', content: record.objective, color: 'border-l-emerald-500' },
                                                        { letter: 'A', title: 'Avaliação', content: record.assessment, color: 'border-l-amber-500' },
                                                        { letter: 'P', title: 'Plano', content: record.plan, color: 'border-l-purple-500' },
                                                    ].map((section) => (
                                                        <div
                                                            key={section.letter}
                                                            className={`p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border-l-4 ${section.color}`}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="w-6 h-6 rounded-md bg-surface-200 dark:bg-surface-700 flex items-center justify-center text-xs font-bold text-surface-600 dark:text-surface-300">
                                                                    {section.letter}
                                                                </span>
                                                                <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                                                                    {section.title}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-surface-600 dark:text-surface-400 whitespace-pre-line leading-relaxed">
                                                                {section.content}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-800">
                                                    <div className="flex items-center gap-2">
                                                        {!record.isSigned && (
                                                            <Button variant="accent" size="sm" icon={<Shield className="w-3.5 h-3.5" />}>
                                                                Assinar Prontuário
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="sm" icon={<Edit3 className="w-3.5 h-3.5" />}>
                                                            Editar
                                                        </Button>
                                                    </div>
                                                    <span className="text-xs text-surface-400">
                                                        Versão {record.version} • {record.isSigned ? 'Assinado digitalmente' : 'Pendente assinatura'}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Create Record Modal */}
            <RecordModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateRecord}
            />
        </div>
    );
}
