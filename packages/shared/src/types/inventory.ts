// ============================================================================
// Inventory Types (Angola-focused)
// ============================================================================

export type InventoryCategory =
    | 'ANTIBIOTIC'       // Antibiótico
    | 'VACCINE'          // Vacina
    | 'ANESTHETIC'       // Anestésico
    | 'ANTI_INFLAMMATORY'// Anti-inflamatório
    | 'ANTIPARASITIC'    // Antiparasitário
    | 'SURGICAL'         // Material cirúrgico
    | 'CONSUMABLE'       // Material consumível
    | 'EQUIPMENT'        // Equipamento
    | 'SUPPLEMENT'       // Suplemento
    | 'OTHER';

export interface InventoryItemDto {
    id: string;
    tenantId: string;
    name: string;
    category: InventoryCategory;
    sku?: string;
    description?: string;
    stock: number;
    minStock: number;
    unit: string;           // caixas, doses, frascos, unidades, etc.
    price: number;          // Selling price (AOA)
    cost?: number;          // Cost price (AOA)
    supplier?: string;
    expiryDate?: Date;
    batchNumber?: string;
    isControlled: boolean;  // Controlled substance flag
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateInventoryItemDto {
    name: string;
    category: InventoryCategory;
    sku?: string;
    description?: string;
    stock?: number;
    minStock: number;
    unit: string;
    price: number;
    cost?: number;
    supplier?: string;
    expiryDate?: string;
    batchNumber?: string;
    isControlled?: boolean;
}

export interface UpdateInventoryItemDto extends Partial<CreateInventoryItemDto> { }

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovementDto {
    id: string;
    tenantId: string;
    itemId: string;
    itemName?: string;
    type: StockMovementType;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string;
    performedBy: string;
    createdAt: Date;
}
