'use client';

// ============================================================================
// Tutor Creation Modal — Premium Angola-focused
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Plus } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { ANGOLA_PROVINCES } from '@vetsaas/shared';

interface TutorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TutorFormData) => void;
}

export interface TutorFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    province: string;
    city: string;
    documentType: string;
    documentNumber: string;
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

export default function TutorModal({ isOpen, onClose, onSubmit }: TutorModalProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('+244 ');
    const [province, setProvince] = useState('Luanda');
    const [city, setCity] = useState('');
    const [documentType, setDocumentType] = useState('BI');
    const [documentNumber, setDocumentNumber] = useState('');

    const handleSubmit = () => {
        if (!firstName || !lastName || !phone) return;
        onSubmit({ firstName, lastName, email, phone, province, city, documentType, documentNumber });
        setFirstName(''); setLastName(''); setEmail(''); setPhone('+244 ');
        setCity(''); setDocumentNumber('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="tutor-modal-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="tutor-modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="tutor-modal-header">
                            <div className="tutor-modal-title">
                                <div className="tutor-modal-icon">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h2>Novo Tutor</h2>
                                    <p>Registar responsável do animal</p>
                                </div>
                            </div>
                            <button className="tutor-modal-close" onClick={onClose} aria-label="Fechar">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="tutor-modal-body">
                            {/* Name */}
                            <div className="modal-row-2col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="tutor-fname">Nome</label>
                                    <Input id="tutor-fname" placeholder="João" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="tutor-lname">Apelido</label>
                                    <Input id="tutor-lname" placeholder="Silva" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                </div>
                            </div>

                            {/* Email + Phone */}
                            <div className="modal-row-2col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="tutor-email">Email</label>
                                    <Input id="tutor-email" type="email" placeholder="joao@email.ao" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="tutor-phone">Telefone</label>
                                    <Input id="tutor-phone" type="tel" placeholder="+244 923 456 789" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                            </div>

                            {/* Province + City */}
                            <div className="modal-row-2col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="tutor-province">Província</label>
                                    <select id="tutor-province" className="modal-select" value={province} onChange={(e) => setProvince(e.target.value)} aria-label="Província">
                                        {ANGOLA_PROVINCES.map((p: string) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="tutor-city">Cidade</label>
                                    <Input id="tutor-city" placeholder="Luanda" value={city} onChange={(e) => setCity(e.target.value)} />
                                </div>
                            </div>

                            {/* Document */}
                            <div className="modal-row-2col">
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="tutor-doctype">Documento</label>
                                    <select id="tutor-doctype" className="modal-select" value={documentType} onChange={(e) => setDocumentType(e.target.value)} aria-label="Tipo de documento">
                                        <option value="BI">Bilhete de Identidade</option>
                                        <option value="PASSPORT">Passaporte</option>
                                        <option value="OTHER">Outro</option>
                                    </select>
                                </div>
                                <div className="modal-field">
                                    <label className="modal-label" htmlFor="tutor-docnum">Número</label>
                                    <Input id="tutor-docnum" placeholder="123456789LA001" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="tutor-modal-footer">
                            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                            <Button variant="primary" onClick={handleSubmit} disabled={!firstName || !lastName || !phone}>
                                <Plus size={16} />
                                Registar Tutor
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
