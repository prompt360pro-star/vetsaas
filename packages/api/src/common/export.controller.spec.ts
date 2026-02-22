import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { Response } from 'express';

describe('ExportController', () => {
    let controller: ExportController;
    let exportService: ExportService;

    const mockExportService = {
        exportAnimals: jest.fn(),
        exportPayments: jest.fn(),
        exportAudit: jest.fn(),
    };

    const mockResponse = () => {
        const res: Partial<Response> = {};
        res.setHeader = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        return res as Response;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ExportController],
            providers: [
                {
                    provide: ExportService,
                    useValue: mockExportService,
                },
            ],
        }).compile();

        controller = module.get<ExportController>(ExportController);
        exportService = module.get<ExportService>(ExportService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('exportAnimals', () => {
        it('should call exportAnimals and send CSV response', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            const res = mockResponse();
            const csv = 'Nome,Espécie\nRex,Cão';
            mockExportService.exportAnimals.mockResolvedValue(csv);

            await controller.exportAnimals(req, res);

            expect(mockExportService.exportAnimals).toHaveBeenCalledWith('tenant-1');
            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                expect.stringMatching(/attachment; filename="pacientes_\d{4}-\d{2}-\d{2}\.csv"/),
            );
            expect(res.send).toHaveBeenCalledWith('\uFEFF' + csv);
        });
    });

    describe('exportPayments', () => {
        it('should call exportPayments with dates and send CSV response', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            const res = mockResponse();
            const csv = 'Data,Valor\n2025-01-01,100';
            const startDate = '2025-01-01';
            const endDate = '2025-01-31';
            mockExportService.exportPayments.mockResolvedValue(csv);

            await controller.exportPayments(req, res, startDate, endDate);

            expect(mockExportService.exportPayments).toHaveBeenCalledWith(
                'tenant-1',
                new Date(startDate),
                new Date(endDate),
            );
            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                expect.stringMatching(/attachment; filename="pagamentos_\d{4}-\d{2}-\d{2}\.csv"/),
            );
            expect(res.send).toHaveBeenCalledWith('\uFEFF' + csv);
        });

        it('should call exportPayments without dates if not provided', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            const res = mockResponse();
            const csv = 'Data,Valor\n2025-01-01,100';
            mockExportService.exportPayments.mockResolvedValue(csv);

            await controller.exportPayments(req, res, undefined, undefined);

            expect(mockExportService.exportPayments).toHaveBeenCalledWith(
                'tenant-1',
                undefined,
                undefined,
            );
        });
    });

    describe('exportAudit', () => {
        it('should call exportAudit with limit and send CSV response', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            const res = mockResponse();
            const csv = 'Timestamp,Utilizador\n2025-01-01,user-1';
            mockExportService.exportAudit.mockResolvedValue(csv);

            await controller.exportAudit(req, res, '100');

            expect(mockExportService.exportAudit).toHaveBeenCalledWith('tenant-1', 100);
            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                expect.stringMatching(/attachment; filename="auditoria_\d{4}-\d{2}-\d{2}\.csv"/),
            );
            expect(res.send).toHaveBeenCalledWith('\uFEFF' + csv);
        });

        it('should call exportAudit with default limit if not provided', async () => {
            const req = { user: { tenantId: 'tenant-1' } };
            const res = mockResponse();
            const csv = 'Timestamp,Utilizador\n2025-01-01,user-1';
            mockExportService.exportAudit.mockResolvedValue(csv);

            await controller.exportAudit(req, res, undefined);

            expect(mockExportService.exportAudit).toHaveBeenCalledWith('tenant-1', 500);
        });
    });
});
