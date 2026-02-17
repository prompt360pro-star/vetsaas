'use client';

// ============================================================================
// Invoice Creation Modal — Premium Angola-focused
// ============================================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Plus,
    Trash2,
    Receipt,
    Calculator,
    User,
    CreditCard,
} from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { formatKwanza } from '@vetsaas/shared';

interface LineItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: InvoiceFormData) => void;
}

export interface InvoiceFormData {
    tutorId: string;
    tutorName: string;
    items: LineItem[];
    dueDate?: string;
    notes?: string;
    taxRate: number;
    paymentMethod?: string;
}

const PAYMENT_METHODS = [
    { value: 'MULTICAIXA_EXPRESS', label: 'Multicaixa Express' },
    { value: 'MULTICAIXA_REFERENCE', label: 'Referência Multicaixa' },
    { value: 'UNITEL_MONEY', label: 'Unitel Money' },
    { value: 'CASH', label: 'Numerário' },
    { value: 'BANK_TRANSFER', label: 'Transferência Bancária' },
    { value: 'POS', label: 'Ponto de Venda (POS)' },
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

export default function InvoiceModal({ isOpen, onClose, onSubmit }: InvoiceModalProps) {
    const [tutorName, setTutorName] = useState('');
    const [tutorId] = useState(''); // In production: search/select tutor
    const [items, setItems] = useState<LineItem[]>([
        { description: '', quantity: 1, unitPrice: 0 },
    ]);
    const [taxRate, setTaxRate] = useState(14); // IVA Angola
    const [paymentMethod, setPaymentMethod] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');

    const addItem = useCallback(() => {
        setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
    }, []);

    const removeItem = useCallback((index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateItem = useCallback((index: number, field: keyof LineItem, value: string | number) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item,
            ),
        );
    }, []);

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = Math.round(subtotal * taxRate) / 100;
    const total = subtotal + tax;

    const handleSubmit = () => {
        if (!tutorName || items.length === 0 || items.some(i => !i.description || i.unitPrice <= 0)) return;

        onSubmit({
            tutorId: tutorId || 'manual-entry',
            tutorName,
            items,
            dueDate: dueDate || undefined,
            notes: notes || undefined,
            taxRate,
            paymentMethod: paymentMethod || undefined,
        });

        // Reset
        setTutorName('');
        setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
        setNotes('');
        setDueDate('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="invoice-modal-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="invoice-modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="invoice-modal-header">
                            <div className="invoice-modal-title">
                                <div className="invoice-modal-icon">
                                    <Receipt size={20} />
                                </div>
                                <div>
                                    <h2>Nova Fatura</h2>
                                    <p>Criar fatura para cliente</p>
                                </div>
                            </div>
                            <button className="invoice-modal-close" onClick={onClose} aria-label="Fechar">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="invoice-modal-body">
                            {/* Tutor Info */}
                            <div className="invoice-section">
                                <label className="invoice-label">
                                    <User size={14} />
                                    Cliente (Tutor)
                                </label>
                                <Input
                                    placeholder="Nome do cliente..."
                                    value={tutorName}
                                    onChange={(e) => setTutorName(e.target.value)}
                                />
                            </div>

                            {/* Line Items */}
                            <div className="invoice-section">
                                <label className="invoice-label">
                                    <Calculator size={14} />
                                    Itens
                                </label>

                                <div className="invoice-items-header">
                                    <span className="item-desc-header">Descrição</span>
                                    <span className="item-qty-header">Qtd</span>
                                    <span className="item-price-header">Preço (Kz)</span>
                                    <span className="item-total-header">Total</span>
                                    <span className="item-actions-header"></span>
                                </div>

                                {items.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="invoice-item-row"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <input
                                            className="item-input item-desc"
                                            placeholder="Ex: Consulta geral"
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        />
                                        <input
                                            className="item-input item-qty"
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                            aria-label="Quantidade"
                                        />
                                        <input
                                            className="item-input item-price"
                                            type="number"
                                            min="0"
                                            value={item.unitPrice || ''}
                                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                        <span className="item-total">
                                            {formatKwanza(item.quantity * item.unitPrice)}
                                        </span>
                                        {items.length > 1 && (
                                            <button
                                                className="item-remove"
                                                onClick={() => removeItem(index)}
                                                aria-label="Remover item"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}

                                <button className="invoice-add-item" onClick={addItem}>
                                    <Plus size={14} />
                                    Adicionar item
                                </button>
                            </div>

                            {/* Totals */}
                            <div className="invoice-totals">
                                <div className="invoice-total-row">
                                    <span>Subtotal</span>
                                    <span>{formatKwanza(subtotal)}</span>
                                </div>
                                <div className="invoice-total-row">
                                    <span>
                                        IVA (
                                        <input
                                            className="tax-rate-input"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                            aria-label="Taxa IVA"
                                        />
                                        %)
                                    </span>
                                    <span>{formatKwanza(tax)}</span>
                                </div>
                                <div className="invoice-total-row invoice-total-final">
                                    <span>Total</span>
                                    <span>{formatKwanza(total)}</span>
                                </div>
                            </div>

                            {/* Payment Method & Due Date */}
                            <div className="invoice-row-2col">
                                <div className="invoice-section">
                                    <label className="invoice-label">
                                        <CreditCard size={14} />
                                        Método de Pagamento
                                    </label>
                                    <select
                                        className="invoice-select"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        aria-label="Método de pagamento"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {PAYMENT_METHODS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="invoice-section">
                                    <label className="invoice-label">Vencimento</label>
                                    <input
                                        type="date"
                                        className="invoice-date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        aria-label="Data de vencimento"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="invoice-section">
                                <label className="invoice-label">Observações</label>
                                <textarea
                                    className="invoice-textarea"
                                    placeholder="Notas adicionais..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="invoice-modal-footer">
                            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={!tutorName || items.some(i => !i.description || i.unitPrice <= 0)}
                            >
                                <Receipt size={16} />
                                Criar Fatura — {formatKwanza(total)}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
