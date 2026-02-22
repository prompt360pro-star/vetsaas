import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
    let controller: InventoryController;
    let service: InventoryService;

    const mockInventoryService = {
        create: jest.fn(),
        findAll: jest.fn(),
        getLowStockAlerts: jest.fn(),
        getExpiringSoon: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        adjustStock: jest.fn(),
        getMovements: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InventoryController],
            providers: [
                {
                    provide: InventoryService,
                    useValue: mockInventoryService,
                },
            ],
        }).compile();

        controller = module.get<InventoryController>(InventoryController);
        service = module.get<InventoryService>(InventoryService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create with correct parameters', async () => {
            const req = { user: { tenantId: 'tenant-1', sub: 'user-1' } };
            const body = {
                name: 'Item 1',
                category: 'Category 1',
                minStock: 10,
                unit: 'Unit',
                price: 100,
            };
            mockInventoryService.create.mockResolvedValue(body);

            await controller.create(req, body);

            expect(service.create).toHaveBeenCalledWith('tenant-1', 'user-1', body);
        });
    });

    describe('findAll', () => {
        it('should call service.findAll with correct parameters', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            const query = {
                page: '2',
                limit: '10',
                category: 'Category 1',
                search: 'Search',
                lowStock: 'true',
            };
            mockInventoryService.findAll.mockResolvedValue({ data: [], total: 0 });

            await controller.findAll(
                req,
                query.page,
                query.limit,
                query.category,
                query.search,
                query.lowStock,
            );

            expect(service.findAll).toHaveBeenCalledWith('tenant-1', {
                page: 2,
                limit: 10,
                category: 'Category 1',
                search: 'Search',
                lowStock: true,
            });
        });

        it('should use default values for page and limit', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            mockInventoryService.findAll.mockResolvedValue({ data: [], total: 0 });

            await controller.findAll(req);

            expect(service.findAll).toHaveBeenCalledWith('tenant-1', {
                page: 1,
                limit: 20,
                category: undefined,
                search: undefined,
                lowStock: false,
            });
        });
    });

    describe('getAlerts', () => {
        it('should call service.getLowStockAlerts and service.getExpiringSoon', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            mockInventoryService.getLowStockAlerts.mockResolvedValue([]);
            mockInventoryService.getExpiringSoon.mockResolvedValue([]);

            await controller.getAlerts(req);

            expect(service.getLowStockAlerts).toHaveBeenCalledWith('tenant-1');
            expect(service.getExpiringSoon).toHaveBeenCalledWith('tenant-1', 30);
        });
    });

    describe('findById', () => {
        it('should call service.findById with correct parameters', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            const id = 'item-1';
            mockInventoryService.findById.mockResolvedValue({});

            await controller.findById(req, id);

            expect(service.findById).toHaveBeenCalledWith('tenant-1', id);
        });
    });

    describe('update', () => {
        it('should call service.update with correct parameters', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            const id = 'item-1';
            const body = { name: 'Updated Item' };
            mockInventoryService.update.mockResolvedValue({});

            await controller.update(req, id, body);

            expect(service.update).toHaveBeenCalledWith('tenant-1', id, body);
        });
    });

    describe('adjustStock', () => {
        it('should call service.adjustStock with correct parameters', async () => {
            const req = { user: { tenantId: 'tenant-1', sub: 'user-1' } };
            const id = 'item-1';
            const body = { quantity: 10, type: 'IN' as const, reason: 'Reason' };
            mockInventoryService.adjustStock.mockResolvedValue({});

            await controller.adjustStock(req, id, body);

            expect(service.adjustStock).toHaveBeenCalledWith('tenant-1', 'user-1', id, body);
        });
    });

    describe('getMovements', () => {
        it('should call service.getMovements with correct parameters', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            const id = 'item-1';
            const limit = '10';
            mockInventoryService.getMovements.mockResolvedValue([]);

            await controller.getMovements(req, id, limit);

            expect(service.getMovements).toHaveBeenCalledWith('tenant-1', id, 10);
        });

        it('should use default limit', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            const id = 'item-1';
            mockInventoryService.getMovements.mockResolvedValue([]);

            await controller.getMovements(req, id);

            expect(service.getMovements).toHaveBeenCalledWith('tenant-1', id, 20);
        });
    });
});
