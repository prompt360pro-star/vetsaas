'use client';

// ============================================================================
// Animal Creation Modal — Species-aware breed selection
// ============================================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dog, Plus } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { SPECIES, DOG_BREEDS, CAT_BREEDS } from '@vetsaas/shared';

interface AnimalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AnimalFormData) => void;
}

export interface AnimalFormData {
    name: string;
    species: string;
    breed: string;
    sex: string;
    weight: number;
    weightUnit: string;
    microchipId: string;
    dateOfBirth: string;
    isNeutered: boolean;
}

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.95, y: 20 },
};

export default function AnimalModal({ isOpen, onClose, onSubmit }: AnimalModalProps) {
    const [name, setName] = useState('');
    const [species, setSpecies] = useState('CANINE');
    const [breed, setBreed] = useState('');
    const [sex, setSex] = useState('MALE');
    const [weight, setWeight] = useState(0);
    const [weightUnit, setWeightUnit] = useState('kg');
    const [microchipId, setMicrochipId] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [isNeutered, setIsNeutered] = useState(false);

    // Dynamic breed list based on species
    const breeds = useMemo(() => {
        if (species === 'CANINE') return DOG_BREEDS;
        if (species === 'FELINE') return CAT_BREEDS;
        return [];
    }, [species]);

    const handleSubmit = () => {
        if (!name || !species) return;
        onSubmit({ name, species, breed, sex, weight, weightUnit, microchipId, dateOfBirth, isNeutered });
        setName(''); setBreed(''); setWeight(0); setMicrochipId(''); setDateOfBirth('');
        setIsNeutered(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="animal-modal-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="animal-modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="animal-modal-header">
                            <div className="animal-modal-title">
                                <div className="animal-modal-icon">
                                    <Dog size={20} />
                                </div>
                                <div>
                                    <h2>Novo Animal</h2>
                                    <p>Registar paciente</p>
                                </div>
                            </div>
                            <button className="animal-modal-close" onClick={onClose} aria-label="Fechar">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="animal-modal-body">
                            {/* Name + Species */}
                            <div className="modal-row-2col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="animal-name">Nome</label>
                                    <Input id="animal-name" placeholder="Rex" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="animal-species">Espécie</label>
                                    <select
                                        id="animal-species"
                                        className="modal-select"
                                        value={species}
                                        onChange={(e) => { setSpecies(e.target.value); setBreed(''); }}
                                        aria-label="Espécie"
                                    >
                                        {SPECIES.map((s) => (
                                            <option key={s.code} value={s.code}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Breed + Sex */}
                            <div className="modal-row-2col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="animal-breed">Raça</label>
                                    {breeds.length > 0 ? (
                                        <select id="animal-breed" className="modal-select" value={breed} onChange={(e) => setBreed(e.target.value)} aria-label="Raça">
                                            <option value="">Selecionar raça</option>
                                            {breeds.map((b: string) => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input id="animal-breed" placeholder="Raça" value={breed} onChange={(e) => setBreed(e.target.value)} />
                                    )}
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="animal-sex">Sexo</label>
                                    <select id="animal-sex" className="modal-select" value={sex} onChange={(e) => setSex(e.target.value)} aria-label="Sexo">
                                        <option value="MALE">Macho</option>
                                        <option value="FEMALE">Fêmea</option>
                                    </select>
                                </div>
                            </div>

                            {/* Weight + Microchip */}
                            <div className="modal-row-2col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="animal-weight">Peso</label>
                                    <div className="modal-row-2col" style={{ gap: '0.5rem' }}>
                                        <Input id="animal-weight" type="number" min="0" step="0.1" placeholder="0" value={weight || ''} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} />
                                        <select className="modal-select" value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} aria-label="Unidade de peso">
                                            <option value="kg">kg</option>
                                            <option value="g">g</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="animal-chip">Microchip</label>
                                    <Input id="animal-chip" placeholder="900118000123456" value={microchipId} onChange={(e) => setMicrochipId(e.target.value)} />
                                </div>
                            </div>

                            {/* DOB + Neutered */}
                            <div className="modal-row-2col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="animal-dob">Data de Nascimento</label>
                                    <input id="animal-dob" type="date" className="modal-date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} aria-label="Data de nascimento" />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label">Castrado/Esterilizado</label>
                                    <label className="modal-toggle">
                                        <input type="checkbox" checked={isNeutered} onChange={(e) => setIsNeutered(e.target.checked)} />
                                        <span className="modal-toggle-slider" />
                                        <span className="modal-toggle-text">{isNeutered ? 'Sim' : 'Não'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="animal-modal-footer">
                            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                            <Button variant="primary" onClick={handleSubmit} disabled={!name || !species}>
                                <Plus size={16} />
                                Registar Animal
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
