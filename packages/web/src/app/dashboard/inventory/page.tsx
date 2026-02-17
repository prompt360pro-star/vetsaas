'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Search, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { formatKwanza } from '@vetsaas/shared';
import ProductModal from '@/components/inventory/ProductModal';
import type { ProductFormData } from '@/components/inventory/ProductModal';
import '@/components/inventory/ProductModal.css';

const mockInventory = [
    { id: '1', name: 'Amoxicilina 500mg', category: 'Antibiótico', stock: 5, minStock: 20, unit: 'caixas', price: 3500, expiry: '2025-06-15' },
    { id: '2', name: 'Vacina Antirrábica', category: 'Vacina', stock: 32, minStock: 10, unit: 'doses', price: 2000, expiry: '2025-03-20' },
    { id: '3', name: 'Ketamina 10ml', category: 'Anestésico', stock: 3, minStock: 10, unit: 'frascos', price: 8500, expiry: '2025-09-01' },
    { id: '4', name: 'Meloxicam 5mg', category: 'Anti-inflamatório', stock: 45, minStock: 15, unit: 'comprimidos', price: 1200, expiry: '2025-12-30' },
    { id: '5', name: 'Seringa 5ml', category: 'Material', stock: 200, minStock: 50, unit: 'unidades', price: 150, expiry: null },
    { id: '6', name: 'Luvas de Exame (M)', category: 'Material', stock: 150, minStock: 100, unit: 'pares', price: 80, expiry: null },
    { id: '7', name: 'Doxiciclina 100mg', category: 'Antibiótico', stock: 28, minStock: 15, unit: 'cápsulas', price: 2800, expiry: '2026-01-15' },
    { id: '8', name: 'Fio de Sutura 3-0', category: 'Cirúrgico', stock: 18, minStock: 10, unit: 'unidades', price: 4500, expiry: '2026-06-01' },
];

export default function InventoryPage() {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const handleCreateProduct = (data: ProductFormData) => {
        // TODO: POST to /inventory API
        console.log('[CREATE PRODUCT]', data);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        Inventário
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        Estoque de produtos e materiais
                    </p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsProductModalOpen(true)}>Novo Produto</Button>
            </div>

            {/* Alert */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-danger-light dark:bg-danger/10 border border-danger/20 flex items-center gap-3"
            >
                <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-danger-dark dark:text-red-400">
                        2 produtos abaixo do estoque mínimo
                    </p>
                    <p className="text-xs text-surface-600 dark:text-surface-400 mt-0.5">
                        Amoxicilina 500mg (5/20), Ketamina 10ml (3/10)
                    </p>
                </div>
            </motion.div>

            {/* Search */}
            <div className="glass-card p-4">
                <Input placeholder="Pesquisar produto..." icon={<Search className="w-4 h-4" />} />
            </div>

            {/* Inventory Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-100 dark:border-surface-800">
                                {['Produto', 'Categoria', 'Estoque', 'Preço', 'Validade'].map((h) => (
                                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {mockInventory.map((item, i) => {
                                const isLow = item.stock < item.minStock;
                                return (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="border-b border-surface-50 dark:border-surface-800/50 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{item.name}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="badge bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">{item.category}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-semibold ${isLow ? 'text-danger' : 'text-surface-700 dark:text-surface-300'}`}>
                                                    {item.stock}
                                                </span>
                                                <span className="text-xs text-surface-400">/ {item.minStock} min</span>
                                                {isLow && <TrendingDown className="w-3.5 h-3.5 text-danger" />}
                                            </div>
                                            <div className="w-24 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full mt-1">
                                                <div
                                                    className={`h-full rounded-full transition-all ${isLow ? 'bg-danger' : 'bg-success'}`}
                                                    style={{ width: `${Math.min((item.stock / item.minStock) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-surface-700 dark:text-surface-300">{formatKwanza(item.price)}</span>
                                            <span className="text-xs text-surface-400 ml-1">/ {item.unit}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {item.expiry ? (
                                                <span className="text-sm text-surface-500">{new Date(item.expiry).toLocaleDateString('pt-AO')}</span>
                                            ) : (
                                                <span className="text-xs text-surface-400">N/A</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Modal */}
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSubmit={handleCreateProduct}
            />
        </div>
    );
}
