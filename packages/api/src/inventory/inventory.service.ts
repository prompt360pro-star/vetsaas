// ============================================================================
// Inventory Service — Core Logic for Stock Management
// ============================================================================

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItemEntity } from './inventory-item.entity';
import { StockMovementEntity } from './stock-movement.entity';

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(InventoryItemEntity)
        private readonly itemRepo: Repository<InventoryItemEntity>,
        @InjectRepository(StockMovementEntity)
        private readonly movementRepo: Repository<StockMovementEntity>,
    ) { }

    async createItem(tenantId: string, dto: any): Promise<InventoryItemEntity> {
        // Check SKU uniqueness per tenant
        const existing = await this.itemRepo.createQueryBuilder('i')
            .where('i.tenantId = :tenantId', { tenantId })
            .andWhere('i.sku = :sku', { sku: dto.sku })
            .getCount();

        if (existing > 0) {
            throw new BadRequestException(`SKU '${dto.sku}' already exists.`);
        }

        const item = this.itemRepo.create({
            ...dto,
            tenantId,
        });

        await this.itemRepo.save(item);

        // Record initial stock movement if quantity > 0
        if (dto.quantity > 0) {
            await this.movementRepo.save({
                itemId: item.id,
                tenantId,
                type: 'IN',
                quantity: dto.quantity,
                reason: 'Initial Stock',
                reference: 'INIT',
                createdBy: 'system', // TODO: Add current user context
            });
        }

        return item;
    }

    async adjustStock(
        tenantId: string,
        itemId: string,
        quantityChange: number,
        reason: string,
        reference?: string,
    ): Promise<InventoryItemEntity> {
        const item = await this.itemRepo.findOne({ where: { id: itemId, tenantId } });
        if (!item) throw new NotFoundException('Item not found');

        const newQuantity = item.quantity + quantityChange;

        if (newQuantity < 0) {
            throw new BadRequestException(`Insufficient stock. Current: ${item.quantity}, Requested reduction: ${Math.abs(quantityChange)}`);
        }

        item.quantity = newQuantity;
        await this.itemRepo.save(item);

        await this.movementRepo.save({
            itemId: item.id,
            tenantId,
            type: quantityChange > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(quantityChange),
            reason,
            reference: reference || 'MANUAL_ADJUST',
            createdBy: 'system',
        });

        return item;
    }

    async getLowStockAlerts(tenantId: string): Promise<InventoryItemEntity[]> {
        // Find items where quantity <= minQuantity
        return this.itemRepo.createQueryBuilder('i')
            .where('i.tenantId = :tenantId', { tenantId })
            .andWhere('i.quantity <= i.minQuantity')
            .getMany();
    }

    async getExpiringSoon(tenantId: string, days = 30): Promise<InventoryItemEntity[]> {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + days);

        return this.itemRepo.createQueryBuilder('i')
            .where('i.tenantId = :tenantId', { tenantId })
            .andWhere('i.expiryDate IS NOT NULL')
            .andWhere('i.expiryDate <= :thresholdDate', { thresholdDate })
            .andWhere('i.expiryDate >= :now', { now: new Date() }) // Don't show already expired in this list? Or show expired too? Let's show upcoming.
            .getMany();
    }

    async getInventoryValuation(tenantId: string): Promise<{ totalValue: number; itemCount: number }> {
        const items = await this.itemRepo.find({ where: { tenantId } });

        const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return { totalValue, itemCount };
    }
}
