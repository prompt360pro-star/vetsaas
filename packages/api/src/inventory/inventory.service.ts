// ============================================================================
// Inventory Service — Stock management with movement tracking
// ============================================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InventoryItemEntity } from './inventory-item.entity';
import { StockMovementEntity } from './stock-movement.entity';

export interface CreateItemInput {
  name: string;
  category: string;
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

export interface StockAdjustInput {
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason?: string;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(InventoryItemEntity)
    private readonly itemRepo: Repository<InventoryItemEntity>,
    @InjectRepository(StockMovementEntity)
    private readonly movementRepo: Repository<StockMovementEntity>,
  ) {}

  // ── Create Item ────────────────────────────────────────────────────
  async create(tenantId: string, userId: string, input: CreateItemInput) {
    if (!input.name || !input.unit || !input.price) {
      throw new BadRequestException('Nome, unidade e preço são obrigatórios');
    }

    const item = this.itemRepo.create({
      tenantId,
      name: input.name,
      category: input.category || 'OTHER',
      sku: input.sku || undefined,
      description: input.description || undefined,
      stock: input.stock ?? 0,
      minStock: input.minStock ?? 0,
      unit: input.unit,
      price: input.price,
      cost: input.cost ?? undefined,
      supplier: input.supplier || undefined,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
      batchNumber: input.batchNumber || undefined,
      isControlled: input.isControlled ?? false,
      createdBy: userId,
    } as Partial<InventoryItemEntity>);

    const saved = await this.itemRepo.save(item);

    // If initial stock is set, record a movement
    if ((saved as InventoryItemEntity).stock > 0) {
      await this.recordMovement(
        tenantId,
        userId,
        (saved as InventoryItemEntity).id,
        {
          type: 'IN',
          quantity: (saved as InventoryItemEntity).stock,
          previousStock: 0,
          newStock: (saved as InventoryItemEntity).stock,
          reason: 'Estoque inicial',
        },
      );
    }

    this.logger.log(
      `[CREATE] Item "${(saved as InventoryItemEntity).name}" (${(saved as InventoryItemEntity).id}) | Tenant: ${tenantId}`,
    );
    return saved;
  }

  // ── Find All ───────────────────────────────────────────────────────
  async findAll(
    tenantId: string,
    query: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
      lowStock?: boolean;
    },
  ) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const where: any = { tenantId, isActive: true };
    if (query.category) where.category = query.category;

    const qb = this.itemRepo
      .createQueryBuilder('item')
      .where('item.tenantId = :tenantId', { tenantId })
      .andWhere('item.isActive = :active', { active: true });

    if (query.category) {
      qb.andWhere('item.category = :category', { category: query.category });
    }

    if (query.search) {
      qb.andWhere('(item.name ILIKE :search OR item.sku ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.lowStock) {
      qb.andWhere('item.stock < item.minStock');
    }

    qb.orderBy('item.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Find By ID ─────────────────────────────────────────────────────
  async findById(tenantId: string, id: string) {
    const item = await this.itemRepo.findOne({
      where: { id, tenantId },
    });
    if (!item) throw new NotFoundException('Produto não encontrado');
    return item;
  }

  // ── Update ─────────────────────────────────────────────────────────
  async update(tenantId: string, id: string, input: Partial<CreateItemInput>) {
    const item = await this.findById(tenantId, id);

    if (input.name !== undefined) item.name = input.name;
    if (input.category !== undefined) item.category = input.category;
    if (input.sku !== undefined) item.sku = input.sku;
    if (input.description !== undefined) item.description = input.description;
    if (input.minStock !== undefined) item.minStock = input.minStock;
    if (input.unit !== undefined) item.unit = input.unit;
    if (input.price !== undefined) item.price = input.price;
    if (input.cost !== undefined) item.cost = input.cost;
    if (input.supplier !== undefined) item.supplier = input.supplier;
    if (input.expiryDate !== undefined)
      item.expiryDate = input.expiryDate
        ? new Date(input.expiryDate)
        : (undefined as any);
    if (input.batchNumber !== undefined) item.batchNumber = input.batchNumber;
    if (input.isControlled !== undefined)
      item.isControlled = input.isControlled;

    return this.itemRepo.save(item);
  }

  // ── Adjust Stock ───────────────────────────────────────────────────
  async adjustStock(
    tenantId: string,
    userId: string,
    itemId: string,
    input: StockAdjustInput,
  ) {
    const item = await this.findById(tenantId, itemId);
    const previousStock = item.stock;

    let newStock: number;
    switch (input.type) {
      case 'IN':
        newStock = previousStock + Math.abs(input.quantity);
        break;
      case 'OUT':
        newStock = previousStock - Math.abs(input.quantity);
        if (newStock < 0) {
          throw new BadRequestException(
            `Estoque insuficiente. Disponível: ${previousStock} ${item.unit}`,
          );
        }
        break;
      case 'ADJUSTMENT':
        newStock = input.quantity; // Direct set
        break;
      default:
        throw new BadRequestException('Tipo de movimento inválido');
    }

    item.stock = newStock;
    await this.itemRepo.save(item);

    await this.recordMovement(tenantId, userId, itemId, {
      type: input.type,
      quantity: input.quantity,
      previousStock,
      newStock,
      reason: input.reason,
    });

    this.logger.log(
      `[STOCK] ${input.type} ${input.quantity} "${item.name}" | ${previousStock} → ${newStock} | Tenant: ${tenantId}`,
    );

    return { item, previousStock, newStock, movement: input.type };
  }

  // ── Get Movements ──────────────────────────────────────────────────
  async getMovements(tenantId: string, itemId: string, limit = 20) {
    return this.movementRepo.find({
      where: { tenantId, itemId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // ── Low Stock Alerts ───────────────────────────────────────────────
  async getLowStockAlerts(tenantId: string) {
    const items = await this.itemRepo
      .createQueryBuilder('item')
      .where('item.tenantId = :tenantId', { tenantId })
      .andWhere('item.isActive = true')
      .andWhere('item.stock < item.minStock')
      .orderBy('(item.stock::float / NULLIF(item.minStock, 0))', 'ASC')
      .getMany();

    return { count: items.length, items };
  }

  // ── Expiring Soon ──────────────────────────────────────────────────
  async getExpiringSoon(tenantId: string, daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const items = await this.itemRepo.find({
      where: {
        tenantId,
        isActive: true,
        expiryDate: LessThan(futureDate),
      },
      order: { expiryDate: 'ASC' },
    });

    return { count: items.length, items, daysAhead };
  }

  // ── Private: Record Movement ───────────────────────────────────────
  private async recordMovement(
    tenantId: string,
    userId: string,
    itemId: string,
    data: {
      type: string;
      quantity: number;
      previousStock: number;
      newStock: number;
      reason?: string;
    },
  ) {
    const movement = this.movementRepo.create({
      tenantId,
      itemId,
      type: data.type,
      quantity: data.quantity,
      previousStock: data.previousStock,
      newStock: data.newStock,
      reason: data.reason || undefined,
      performedBy: userId,
    } as any);
    return this.movementRepo.save(movement);
  }
}
