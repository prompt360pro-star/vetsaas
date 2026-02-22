// ============================================================================
// Inventory Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryItemEntity } from './inventory-item.entity';
import { StockMovementEntity } from './stock-movement.entity';

describe('InventoryService', () => {
    let service: InventoryService;
    let itemRepo: any;
    let movementRepo: any;

    const tenantId = 'tenant-uuid-1';
    const userId = 'user-uuid-1';

    const mockItem: Partial<InventoryItemEntity> = {
        id: 'item-uuid-1',
        tenantId,
        name: 'Amoxicilina 500mg',
        category: 'ANTIBIOTIC',
        sku: 'AMX-500',
        stock: 20,
        minStock: 10,
        unit: 'caixas',
        price: 3500,
        isControlled: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryService,
                {
                    provide: getRepositoryToken(InventoryItemEntity),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        findAndCount: jest.fn(),
                        createQueryBuilder: jest.fn().mockReturnValue({
                            where: jest.fn().mockReturnThis(),
                            andWhere: jest.fn().mockReturnThis(),
                            orderBy: jest.fn().mockReturnThis(),
                            skip: jest.fn().mockReturnThis(),
                            take: jest.fn().mockReturnThis(),
                            getManyAndCount: jest
                                .fn()
                                .mockResolvedValue([[mockItem], 1]),
                            getMany: jest.fn().mockResolvedValue([]),
                        }),
                    },
                },
                {
                    provide: getRepositoryToken(StockMovementEntity),
                    useValue: {
                        create: jest.fn().mockReturnValue({}),
                        save: jest.fn().mockResolvedValue({}),
                        find: jest.fn().mockResolvedValue([]),
                    },
                },
            ],
        }).compile();

        service = module.get<InventoryService>(InventoryService);
        itemRepo = module.get(getRepositoryToken(InventoryItemEntity));
        movementRepo = module.get(getRepositoryToken(StockMovementEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create item and record initial stock movement', async () => {
            const saved = { ...mockItem, stock: 50 };
            itemRepo.create.mockReturnValue(saved);
            itemRepo.save.mockResolvedValue(saved);

            const result = await service.create(tenantId, userId, {
                name: 'Amoxicilina 500mg',
                category: 'ANTIBIOTIC',
                minStock: 10,
                unit: 'caixas',
                price: 3500,
                stock: 50,
            });

            expect(itemRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    tenantId,
                    name: 'Amoxicilina 500mg',
                    stock: 50,
                }),
            );
            // Should record initial stock movement
            expect(movementRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'IN',
                    quantity: 50,
                    previousStock: 0,
                    newStock: 50,
                    reason: 'Estoque inicial',
                }),
            );
            expect(result).toBeDefined();
        });

        it('should reject if required fields missing', async () => {
            await expect(
                service.create(tenantId, userId, {
                    name: '',
                    category: 'OTHER',
                    minStock: 0,
                    unit: '',
                    price: 0,
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('findAll', () => {
        it('should return paginated items', async () => {
            const result = await service.findAll(tenantId, {
                page: 1,
                limit: 10,
            });

            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });
    });

    describe('findById', () => {
        it('should return item', async () => {
            itemRepo.findOne.mockResolvedValue(mockItem);
            const result = await service.findById(tenantId, 'item-uuid-1');
            expect(result.name).toBe('Amoxicilina 500mg');
        });

        it('should throw NotFoundException', async () => {
            itemRepo.findOne.mockResolvedValue(null);
            await expect(service.findById(tenantId, 'x')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('update', () => {
        it('should update item fields', async () => {
            itemRepo.findOne.mockResolvedValue({ ...mockItem });
            itemRepo.save.mockResolvedValue({ ...mockItem, price: 4000 });

            await service.update(tenantId, 'item-uuid-1', {
                price: 4000,
            });
            expect(itemRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({ price: 4000 }),
            );
        });
    });

    describe('adjustStock', () => {
        it('should add stock (IN)', async () => {
            const item = { ...mockItem, stock: 20 };
            itemRepo.findOne.mockResolvedValue(item);
            itemRepo.save.mockResolvedValue({ ...item, stock: 30 });

            await service.adjustStock(tenantId, userId, 'item-uuid-1', {
                quantity: 10,
                type: 'IN',
                reason: 'Reposição mensal',
            });

            expect(item.stock).toBe(30);
            expect(movementRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'IN',
                    previousStock: 20,
                    newStock: 30,
                }),
            );
        });

        it('should remove stock (OUT)', async () => {
            const item = { ...mockItem, stock: 20 };
            itemRepo.findOne.mockResolvedValue(item);
            itemRepo.save.mockResolvedValue({ ...item, stock: 15 });

            await service.adjustStock(tenantId, userId, 'item-uuid-1', {
                quantity: 5,
                type: 'OUT',
                reason: 'Uso em consulta',
            });

            expect(item.stock).toBe(15);
        });

        it('should reject OUT if insufficient stock', async () => {
            const item = { ...mockItem, stock: 3 };
            itemRepo.findOne.mockResolvedValue(item);

            await expect(
                service.adjustStock(tenantId, userId, 'item-uuid-1', {
                    quantity: 10,
                    type: 'OUT',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should set stock directly (ADJUSTMENT)', async () => {
            const item = { ...mockItem, stock: 20 };
            itemRepo.findOne.mockResolvedValue(item);
            itemRepo.save.mockResolvedValue({ ...item, stock: 50 });

            await service.adjustStock(tenantId, userId, 'item-uuid-1', {
                quantity: 50,
                type: 'ADJUSTMENT',
                reason: 'Contagem física',
            });

            expect(item.stock).toBe(50);
        });
    });

    describe('getMovements', () => {
        it('should return movement history', async () => {
            const movements = [
                {
                    id: '1',
                    type: 'IN',
                    quantity: 10,
                    previousStock: 0,
                    newStock: 10,
                },
            ];
            movementRepo.find.mockResolvedValue(movements);

            const result = await service.getMovements(tenantId, 'item-uuid-1');
            expect(result).toHaveLength(1);
        });
    });

    describe('getLowStockAlerts', () => {
        it('should return items below minimum', async () => {
            const qb = itemRepo.createQueryBuilder();
            qb.getMany.mockResolvedValue([
                { ...mockItem, stock: 3, minStock: 10 },
            ]);

            const result = await service.getLowStockAlerts(tenantId);
            expect(result.count).toBe(1);
            expect(result.items[0].stock).toBeLessThan(
                result.items[0].minStock,
            );
        });
    });

    describe('getExpiringSoon', () => {
        it('should return items expiring within window', async () => {
            const expiring = { ...mockItem, expiryDate: new Date() };
            itemRepo.find.mockResolvedValue([expiring]);

            const result = await service.getExpiringSoon(tenantId, 30);
            expect(result.count).toBe(1);
            expect(result.daysAhead).toBe(30);
        });
    });
});
