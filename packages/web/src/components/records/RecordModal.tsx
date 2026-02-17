'use client';

// ============================================================================
// Clinical Record (SOAP) Creation Modal
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Plus, Thermometer, Heart, Activity, Weight } from 'lucide-react';
import { Input, Button } from '@/components/ui';

interface RecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RecordFormData) => void;
}

export interface RecordFormData {
    animalName: string;
    veterinarian: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    weight: number;
    bodyConditionScore: number;
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

export default function RecordModal({ isOpen, onClose, onSubmit }: RecordModalProps) {
    const [animalName, setAnimalName] = useState('');
    const [veterinarian, setVeterinarian] = useState('');
    const [subjective, setSubjective] = useState('');
    const [objective, setObjective] = useState('');
    const [assessment, setAssessment] = useState('');
    const [plan, setPlan] = useState('');
    const [temperature, setTemperature] = useState(38.5);
    const [heartRate, setHeartRate] = useState(80);
    const [respiratoryRate, setRespiratoryRate] = useState(20);
    const [weight, setWeight] = useState(0);
    const [bodyConditionScore, setBodyConditionScore] = useState(5);

    const handleSubmit = () => {
        if (!animalName || !subjective) return;
        onSubmit({
            animalName, veterinarian, subjective, objective, assessment, plan,
            temperature, heartRate, respiratoryRate, weight, bodyConditionScore,
        });
        setAnimalName(''); setVeterinarian('');
        setSubjective(''); setObjective(''); setAssessment(''); setPlan('');
        setTemperature(38.5); setHeartRate(80); setRespiratoryRate(20);
        setWeight(0); setBodyConditionScore(5);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="record-modal-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="record-modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="record-modal-header">
                            <div className="record-modal-title">
                                <div className="record-modal-icon">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h2>Nova Ficha Clínica</h2>
                                    <p>Registo SOAP</p>
                                </div>
                            </div>
                            <button className="record-modal-close" onClick={onClose} aria-label="Fechar">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="record-modal-body">
                            {/* Animal + Vet */}
                            <div className="modal-row-2col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="rec-animal">Animal</label>
                                    <Input id="rec-animal" placeholder="Nome do paciente" value={animalName} onChange={(e) => setAnimalName(e.target.value)} />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="rec-vet">Veterinário</label>
                                    <Input id="rec-vet" placeholder="Dr./Dra." value={veterinarian} onChange={(e) => setVeterinarian(e.target.value)} />
                                </div>
                            </div>

                            {/* Vitals */}
                            <div className="modal-section-label">Sinais Vitais</div>
                            <div className="vitals-grid">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="rec-temp">
                                        <Thermometer size={12} style={{ display: 'inline', marginRight: 4 }} />
                                        Temp. (°C)
                                    </label>
                                    <Input id="rec-temp" type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)} placeholder="38.5" />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="rec-hr">
                                        <Heart size={12} style={{ display: 'inline', marginRight: 4 }} />
                                        FC (bpm)
                                    </label>
                                    <Input id="rec-hr" type="number" value={heartRate} onChange={(e) => setHeartRate(parseInt(e.target.value) || 0)} placeholder="80" />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="rec-rr">
                                        <Activity size={12} style={{ display: 'inline', marginRight: 4 }} />
                                        FR (rpm)
                                    </label>
                                    <Input id="rec-rr" type="number" value={respiratoryRate} onChange={(e) => setRespiratoryRate(parseInt(e.target.value) || 0)} placeholder="20" />
                                </div>
                            </div>
                            <div className="modal-row-2col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="rec-weight">
                                        <Weight size={12} style={{ display: 'inline', marginRight: 4 }} />
                                        Peso (kg)
                                    </label>
                                    <Input id="rec-weight" type="number" step="0.1" value={weight || ''} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} placeholder="0" />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="rec-bcs">BCS (1-9)</label>
                                    <Input id="rec-bcs" type="number" min="1" max="9" value={bodyConditionScore} onChange={(e) => setBodyConditionScore(parseInt(e.target.value) || 5)} placeholder="5" />
                                </div>
                            </div>

                            {/* SOAP */}
                            <div className="modal-section-label">Registo SOAP</div>

                            <div className="modal-field">
                                <label className="modal-label" htmlFor="rec-s">S — Subjectivo</label>
                                <textarea id="rec-s" className="modal-textarea" placeholder="Queixa principal, histórico..." value={subjective} onChange={(e) => setSubjective(e.target.value)} />
                            </div>

                            <div className="modal-field">
                                <label className="modal-label" htmlFor="rec-o">O — Objectivo</label>
                                <textarea id="rec-o" className="modal-textarea" placeholder="Exame físico, achados..." value={objective} onChange={(e) => setObjective(e.target.value)} />
                            </div>

                            <div className="modal-field">
                                <label className="modal-label" htmlFor="rec-a">A — Avaliação</label>
                                <textarea id="rec-a" className="modal-textarea" placeholder="Diagnóstico diferencial..." value={assessment} onChange={(e) => setAssessment(e.target.value)} />
                            </div>

                            <div className="modal-field">
                                <label className="modal-label" htmlFor="rec-p">P — Plano</label>
                                <textarea id="rec-p" className="modal-textarea" placeholder="Tratamento, medicação, seguimento..." value={plan} onChange={(e) => setPlan(e.target.value)} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="record-modal-footer">
                            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                            <Button variant="primary" onClick={handleSubmit} disabled={!animalName || !subjective}>
                                <Plus size={16} />
                                Criar Ficha
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
