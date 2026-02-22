import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalAlertsController } from './clinical-alerts.controller';
import { ClinicalAlertsService, ClinicalAlert } from './clinical-alerts.service';

describe('ClinicalAlertsController', () => {
    let controller: ClinicalAlertsController;
    let service: ClinicalAlertsService;

    // Mocking only the methods used by the controller.
    // Casting to ClinicalAlertsService to avoid TypeScript errors for missing methods.
    const mockAlertsService = {
        getAlerts: jest.fn(),
    } as unknown as ClinicalAlertsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClinicalAlertsController],
            providers: [
                {
                    provide: ClinicalAlertsService,
                    useValue: mockAlertsService,
                },
            ],
        }).compile();

        controller = module.get<ClinicalAlertsController>(ClinicalAlertsController);
        service = module.get<ClinicalAlertsService>(ClinicalAlertsService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('list', () => {
        it('should return alerts for the current tenant', async () => {
            const tenantId = 'tenant-123';
            // The controller expects a request object with a user property containing the tenantId
            const req = { user: { tenantId } };
            const expectedAlerts: ClinicalAlert[] = [
                {
                    id: 'alert-1',
                    type: 'WARNING',
                    category: 'TEST',
                    title: 'Test Alert',
                    description: 'Test Description',
                    entityType: 'test',
                    createdAt: new Date(),
                },
            ];

            (mockAlertsService.getAlerts as jest.Mock).mockResolvedValue(expectedAlerts);

            const result = await controller.list(req);

            expect(result).toEqual(expectedAlerts);
            expect(service.getAlerts).toHaveBeenCalledWith(tenantId);
        });

        it('should return empty list when no alerts found', async () => {
            const tenantId = 'tenant-123';
            const req = { user: { tenantId } };
            (mockAlertsService.getAlerts as jest.Mock).mockResolvedValue([]);

            const result = await controller.list(req);

            expect(result).toEqual([]);
            expect(service.getAlerts).toHaveBeenCalledWith(tenantId);
        });
    });
});
