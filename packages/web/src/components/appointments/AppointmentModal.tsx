'use client';

// ============================================================================
// Appointment Creation Modal
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Plus, Stethoscope, Video, Scissors, AlertCircle, Syringe } from 'lucide-react';
import { Input, Button } from '@/components/ui';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AppointmentFormData) => void;
}

export interface AppointmentFormData {
    date: string;
    time: string;
    endTime: string;
    type: string;
    animal: string;
    tutor: string;
    vet: string;
    notes: string;
}

const APPOINTMENT_TYPES = [
    { value: 'CONSULTATION', label: 'Consulta', icon: '🩺', color: '#3b82f6' },
    { value: 'VACCINE', label: 'Vacinação', icon: '💉', color: '#10b981' },
    { value: 'SURGERY', label: 'Cirurgia', icon: '✂️', color: '#ef4444' },
    { value: 'EMERGENCY', label: 'Emergência', icon: '🚨', color: '#f59e0b' },
    { value: 'TELECONSULT', label: 'Teleconsulta', icon: '📹', color: '#8b5cf6' },
    { value: 'FOLLOWUP', label: 'Seguimento', icon: '📋', color: '#64748b' },
];

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.95, y: 20 },
};

export default function AppointmentModal({ isOpen, onClose, onSubmit }: AppointmentModalProps) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('09:00');
    const [endTime, setEndTime] = useState('09:30');
    const [type, setType] = useState('CONSULTATION');
    const [animal, setAnimal] = useState('');
    const [tutor, setTutor] = useState('');
    const [vet, setVet] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        if (!date || !time || !animal) return;
        onSubmit({ date, time, endTime, type, animal, tutor, vet, notes });
        setDate(''); setTime('09:00'); setEndTime('09:30');
        setAnimal(''); setTutor(''); setVet(''); setNotes('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="appointment-modal-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="appointment-modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="appointment-modal-header">
                            <div className="appointment-modal-title">
                                <div className="appointment-modal-icon">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h2>Nova Consulta</h2>
                                    <p>Agendar atendimento</p>
                                </div>
                            </div>
                            <button className="appointment-modal-close" onClick={onClose} aria-label="Fechar">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="appointment-modal-body">
                            {/* Type selector */}
                            <div className="modal-field">
                                <label className="modal-label">Tipo de Consulta</label>
                                <div className="modal-row-3col">
                                    {APPOINTMENT_TYPES.map((t) => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            className={`appointment-type-btn ${type === t.value ? 'active' : ''}`}
                                            style={{ '--type-color': t.color } as React.CSSProperties}
                                            onClick={() => setType(t.value)}
                                        >
                                            <span className="appointment-type-icon">{t.icon}</span>
                                            <span className="appointment-type-label">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date + Time */}
                            <div className="modal-row-3col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="appt-date">Data</label>
                                    <input id="appt-date" type="date" className="modal-date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Data" />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="appt-start">Início</label>
                                    <input id="appt-start" type="time" className="modal-time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Hora de início" />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="appt-end">Fim</label>
                                    <input id="appt-end" type="time" className="modal-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} aria-label="Hora de fim" />
                                </div>
                            </div>

                            {/* Animal + Tutor */}
                            <div className="modal-row-2col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="appt-animal">Animal</label>
                                    <Input id="appt-animal" placeholder="Nome do paciente" value={animal} onChange={(e) => setAnimal(e.target.value)} />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="appt-tutor">Tutor</label>
                                    <Input id="appt-tutor" placeholder="Nome do tutor" value={tutor} onChange={(e) => setTutor(e.target.value)} />
                                </div>
                            </div>

                            {/* Vet */}
                            <div className="modal-field">
                                <label className="modal-label" htmlFor="appt-vet">Veterinário</label>
                                <Input id="appt-vet" placeholder="Dr./Dra." value={vet} onChange={(e) => setVet(e.target.value)} />
                            </div>

                            {/* Notes */}
                            <div className="modal-field">
                                <label className="modal-label" htmlFor="appt-notes">Observações</label>
                                <textarea id="appt-notes" className="modal-textarea" placeholder="Notas adicionais..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="appointment-modal-footer">
                            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                            <Button variant="primary" onClick={handleSubmit} disabled={!date || !time || !animal}>
                                <Plus size={16} />
                                Agendar Consulta
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
