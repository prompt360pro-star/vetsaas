// ============================================================================
// Inventory Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryItemEntity } from './inventory-item.entity';
import { StockMovementEntity } from './stock-movement.entity';
import { Repository } from 'typeorm';

describe('InventoryService', () => {
    let service: InventoryService;
    let itemRepo: Repository<InventoryItemEntity>;
    let movementRepo: Repository<StockMovementEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryService,
                {
                    provide: getRepositoryToken(InventoryItemEntity),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn().mockImplementation((dto) => dto),
                        save: jest.fn().mockImplementation((item) => Promise.resolve({ id: 'uuid-1', ...item })),
                        update: jest.fn(),
                        createQueryBuilder: jest.fn(() => ({
                            where: jest.fn().mockReturnThis(),
                            andWhere: jest.fn().mockReturnThis(),
                            getCount: jest.fn().mockResolvedValue(0),
                        })),
                    },
                },
                {
                    provide: getRepositoryToken(StockMovementEntity),
                    useValue: {
                        create: jest.fn().mockImplementation((dto) => dto),
                        save: jest.fn().mockImplementation((m) => Promise.resolve({ id: 'move-1', ...m })),
                        find: jest.fn(),
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

    describe('createItem', () => {
        it('should create a new inventory item', async () => {
            const dto = {
                name: 'Vacina Antirrábica',
                sku: 'VAC-001',
                category: 'Medication',
                quantity: 50,
                unit: 'vials',
                minQuantity: 10,
                costPrice: 500,
                sellingPrice: 1500,
                supplier: 'MedVet Angola',
                expiryDate: '2025-12-31',
            };

            const result = await service.createItem('tenant-1', dto);

            expect(result).toHaveProperty('id', 'uuid-1');
            expect(itemRepo.save).toHaveBeenCalled();
            expect(movementRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'IN',
                    quantity: 50,
                    reason: 'Initial Stock',
                }),
            );
        });
    });

    describe('adjustStock', () => {
        it('should increase stock', async () => {
            jest.spyOn(itemRepo, 'findOne').mockResolvedValue({
                id: 'uuid-1',
                quantity: 10,
                tenantId: 'tenant-1',
            } as any);

            await service.adjustStock('tenant-1', 'uuid-1', 5, 'Restock', 'PO-123');

            expect(itemRepo.save).toHaveBeenCalledWith(expect.objectContaining({ quantity: 15 }));
            expect(movementRepo.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'IN', quantity: 5 }));
        });

        it('should decrease stock', async () => {
            jest.spyOn(itemRepo, 'findOne').mockResolvedValue({
                id: 'uuid-1',
                quantity: 10,
                tenantId: 'tenant-1',
            } as any);

            await service.adjustStock('tenant-1', 'uuid-1', -3, 'Usage');

            expect(itemRepo.save).toHaveBeenCalledWith(expect.objectContaining({ quantity: 7 }));
            expect(movementRepo.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'OUT', quantity: 3 }));
        });

        it('should prevent negative stock', async () => {
            jest.spyOn(itemRepo, 'findOne').mockResolvedValue({
                id: 'uuid-1',
                quantity: 2,
                tenantId: 'tenant-1',
            } as any);

            await expect(service.adjustStock('tenant-1', 'uuid-1', -5, 'Usage')).rejects.toThrow();
        });
    });

    describe('checkLowStock', () => {
        it('should return items below min quantity', async () => {
            jest.spyOn(itemRepo, 'find').mockResolvedValue([
                { name: 'Item A', quantity: 5, minQuantity: 10 } as any,
            ]);

            const result = await service.getLowStockAlerts('tenant-1');
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Item A');
        });
    });

    describe('getExpiringSoon', () => {
        it('should return items expiring within 30 days', async () => {
            // Mock TypeORM advanced find operators would be complex here,
            // so we'll just check if the repository method is called correctly.
            // In a real integration test, we'd use a real DB.
            const today = new Date();
            const future = new Date();
            future.setDate(today.getDate() + 30);

            // Mocking the raw query or find options
            jest.spyOn(itemRepo, 'find').mockResolvedValue([
                { name: 'Item B', expiryDate: future } as any,
            ]);

            const result = await service.getExpiringSoon('tenant-1', 30);
            expect(itemRepo.find).toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });
    });

    describe('valuation', () => {
        it('should calculate total inventory value', async () => {
            jest.spyOn(itemRepo, 'find').mockResolvedValue([
                { quantity: 10, costPrice: 100 } as any,
                { quantity: 5, costPrice: 200 } as any,
            ]);

            const result = await service.getInventoryValuation('tenant-1');
            expect(result.totalValue).toBe(2000); // 10*100 + 5*200
            expect(result.itemCount).toBe(15);
        });
    });

    describe('sku uniqueness', () => {
        it('should check if sku exists', async () => {
            (itemRepo.createQueryBuilder as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(1),
            });

            await expect(
                service.createItem('tenant-1', {
                    name: 'Test',
                    sku: 'EXISTING',
                    quantity: 1,
                } as any),
            ).rejects.toThrow();
        });
    });
});
