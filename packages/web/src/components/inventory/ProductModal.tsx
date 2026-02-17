'use client';

// ============================================================================
// Product Creation Modal — Premium Angola-focused
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Plus } from 'lucide-react';
import { Input, Button } from '@/components/ui';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProductFormData) => void;
}

export interface ProductFormData {
    name: string;
    category: string;
    sku: string;
    unit: string;
    price: number;
    cost: number;
    minStock: number;
    stock: number;
    supplier: string;
    expiryDate: string;
    batchNumber: string;
    isControlled: boolean;
}

const CATEGORIES = [
    { value: 'ANTIBIOTIC', label: 'Antibiótico' },
    { value: 'VACCINE', label: 'Vacina' },
    { value: 'ANESTHETIC', label: 'Anestésico' },
    { value: 'ANTI_INFLAMMATORY', label: 'Anti-inflamatório' },
    { value: 'ANTIPARASITIC', label: 'Antiparasitário' },
    { value: 'SURGICAL', label: 'Material Cirúrgico' },
    { value: 'CONSUMABLE', label: 'Material Consumível' },
    { value: 'EQUIPMENT', label: 'Equipamento' },
    { value: 'SUPPLEMENT', label: 'Suplemento' },
    { value: 'OTHER', label: 'Outro' },
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

export default function ProductModal({ isOpen, onClose, onSubmit }: ProductModalProps) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('OTHER');
    const [sku, setSku] = useState('');
    const [unit, setUnit] = useState('unidades');
    const [price, setPrice] = useState(0);
    const [cost, setCost] = useState(0);
    const [minStock, setMinStock] = useState(10);
    const [stock, setStock] = useState(0);
    const [supplier, setSupplier] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [batchNumber, setBatchNumber] = useState('');
    const [isControlled, setIsControlled] = useState(false);

    const handleSubmit = () => {
        if (!name || !unit || price <= 0) return;
        onSubmit({
            name, category, sku, unit, price, cost,
            minStock, stock, supplier, expiryDate, batchNumber, isControlled,
        });
        // Reset
        setName(''); setSku(''); setPrice(0); setCost(0);
        setStock(0); setSupplier(''); setExpiryDate(''); setBatchNumber('');
        setIsControlled(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="product-modal-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="product-modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="product-modal-header">
                            <div className="product-modal-title">
                                <div className="product-modal-icon">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <h2>Novo Produto</h2>
                                    <p>Adicionar ao inventário</p>
                                </div>
                            </div>
                            <button className="product-modal-close" onClick={onClose} aria-label="Fechar">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="product-modal-body">
                            {/* Name + Category */}
                            <div className="product-row-2col">
                                <div className="product-field">
                                    <label className="product-label" htmlFor="prod-name">Nome do Produto</label>
                                    <Input id="prod-name" placeholder="Ex: Amoxicilina 500mg" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="product-field">
                                    <label className="product-label" htmlFor="prod-category">Categoria</label>
                                    <select id="prod-category" className="product-select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Categoria">
                                        {CATEGORIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* SKU + Unit */}
                            <div className="product-row-2col">
                                <div className="product-field">
                                    <label className="product-label" htmlFor="prod-sku">SKU</label>
                                    <Input id="prod-sku" placeholder="Ex: AMX-500" value={sku} onChange={(e) => setSku(e.target.value)} />
                                </div>
                                <div className="product-field">
                                    <label className="product-label" htmlFor="prod-unit">Unidade</label>
                                    <Input id="prod-unit" placeholder="caixas, doses, frascos..." value={unit} onChange={(e) => setUnit(e.target.value)} />
                                </div>
                            </div>

                            {/* Price + Cost */}
                            <div className="product-row-2col">
                                <div className="product-field">
                                    <label className="product-label" htmlFor="prod-price">Preço de Venda (Kz)</label>
                                    <Input id="prod-price" type="number" min="0" value={price || ''} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} placeholder="0" />
                                </div>
                                <div className="product-field">
                                    <label className="product-label" htmlFor="prod-cost">Preço de Custo (Kz)</label>
                                    <Input id="prod-cost" type="number" min="0" value={cost || ''} onChange={(e) => setCost(parseFloat(e.target.value) || 0)} placeholder="0" />
                                </div>
                            </div>

                            {/* Stock + Min Stock */}
                            <div className="product-row-2col">
                                <div className="product-field">
                                    <label className="product-label" htmlFor="prod-stock">Estoque Inicial</label>
                                    <Input id="prod-stock" type="number" min="0" value={stock || ''} onChange={(e) => setStock(parseInt(e.target.value) || 0)} placeholder="0" />
                                </div>
                                <div className="product-field">
                                    <label className="product-label" htmlFor="prod-minstock">Estoque Mínimo</label>
                                    <Input id="prod-minstock" type="number" min="0" value={minStock} onChange={(e) => setMinStock(parseInt(e.target.value) || 0)} placeholder="10" />
                                </div>
                            </div>

                            {/* Supplier + Expiry */}
                            <div className="product-row-2col">
                                <div className="product-field">
                                    <label className="product-label" htmlFor="prod-supplier">Fornecedor</label>
                                    <Input id="prod-supplier" placeholder="Nome do fornecedor" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
                                </div>
                                <div className="product-field">
                                    <label className="product-label" htmlFor="prod-expiry">Validade</label>
                                    <input id="prod-expiry" type="date" className="product-date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} aria-label="Data de validade" />
                                </div>
                            </div>

                            {/* Batch + Controlled */}
                            <div className="product-row-2col">
                                <div className="product-field">
                                    <label className="product-label" htmlFor="prod-batch">Número do Lote</label>
                                    <Input id="prod-batch" placeholder="Lote" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
                                </div>
                                <div className="product-field product-toggle-row">
                                    <label className="product-label" htmlFor="prod-controlled">Substância Controlada</label>
                                    <label className="product-toggle">
                                        <input
                                            id="prod-controlled"
                                            type="checkbox"
                                            checked={isControlled}
                                            onChange={(e) => setIsControlled(e.target.checked)}
                                        />
                                        <span className="product-toggle-slider" />
                                        <span className="product-toggle-text">{isControlled ? 'Sim' : 'Não'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="product-modal-footer">
                            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                            <Button variant="primary" onClick={handleSubmit} disabled={!name || !unit || price <= 0}>
                                <Plus size={16} />
                                Adicionar Produto
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
