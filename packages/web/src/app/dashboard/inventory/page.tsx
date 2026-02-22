'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Search, AlertTriangle, TrendingDown } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { formatKwanza } from '@vetsaas/shared';
import ProductModal from '@/components/inventory/ProductModal';
import type { ProductFormData } from '@/components/inventory/ProductModal';
import '@/components/inventory/ProductModal.css';
import { api } from '@/lib/api-client';
import { toast } from '@/components/ui/Toast';

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    stock: number;
    minStock: number;
    unit: string;
    price: number;
    expiryDate: string | null;
}

export default function InventoryPage() {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchInventory = async () => {
        try {
            setIsLoading(true);
            const response = await api.get<{ data: InventoryItem[] }>('/inventory');
            setInventory(response.data);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
            toast('Erro ao carregar inventário', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleCreateProduct = async (data: ProductFormData) => {
        try {
            await api.post('/inventory', {
                ...data,
                // Ensure number fields are numbers
                price: Number(data.price),
                cost: Number(data.cost),
                stock: Number(data.stock),
                minStock: Number(data.minStock),
                // Handle empty strings for optional fields
                sku: data.sku || undefined,
                supplier: data.supplier || undefined,
                expiryDate: data.expiryDate || undefined,
                batchNumber: data.batchNumber || undefined,
            });

            toast('Produto criado com sucesso!', 'success');
            setIsProductModalOpen(false);
            fetchInventory();
        } catch (error: any) {
            console.error('[CREATE PRODUCT ERROR]', error);
            const message = error?.message || 'Erro ao criar produto';
            toast(message, 'error');
        }
    };

    const lowStockItems = inventory.filter(item => item.stock < item.minStock);

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
            {lowStockItems.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-danger-light dark:bg-danger/10 border border-danger/20 flex items-center gap-3"
                >
                    <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-danger-dark dark:text-red-400">
                            {lowStockItems.length} produtos abaixo do estoque mínimo
                        </p>
                        <p className="text-xs text-surface-600 dark:text-surface-400 mt-0.5">
                            {lowStockItems.slice(0, 3).map(i => `${i.name} (${i.stock}/${i.minStock})`).join(', ')}
                            {lowStockItems.length > 3 && '...'}
                        </p>
                    </div>
                </motion.div>
            )}

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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-surface-500">
                                        Carregando inventário...
                                    </td>
                                </tr>
                            ) : inventory.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-surface-500">
                                        Nenhum produto encontrado.
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((item, i) => {
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
                                                        style={{ width: `${Math.min((item.stock / (item.minStock || 1)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-surface-700 dark:text-surface-300">{formatKwanza(item.price)}</span>
                                                <span className="text-xs text-surface-400 ml-1">/ {item.unit}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {item.expiryDate ? (
                                                    <span className="text-sm text-surface-500">{new Date(item.expiryDate).toLocaleDateString('pt-AO')}</span>
                                                ) : (
                                                    <span className="text-xs text-surface-400">N/A</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
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
