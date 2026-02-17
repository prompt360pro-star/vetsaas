// ============================================================================
// Invoices Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoiceEntity } from './invoice.entity';

describe('InvoicesService', () => {
    let service: InvoicesService;
    let repo: any;

    const tenantId = 'tenant-uuid-1';
    const userId = 'user-uuid-1';

    const mockInvoice: Partial<InvoiceEntity> = {
        id: 'inv-uuid-1',
        tenantId,
        tutorId: 'tutor-uuid-1',
        tutorName: 'João Silva',
        invoiceNumber: 'FAT-2025-000001',
        items: [
            { description: 'Consulta geral', quantity: 1, unitPrice: 10000, total: 10000 },
            { description: 'Vacina antirrábica', quantity: 1, unitPrice: 5000, total: 5000 },
        ],
        subtotal: 15000,
        tax: 2100, // 14% IVA
        total: 17100,
        currency: 'AOA',
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InvoicesService,
                {
                    provide: getRepositoryToken(InvoiceEntity),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        findAndCount: jest.fn(),
                        count: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<InvoicesService>(InvoicesService);
        repo = module.get(getRepositoryToken(InvoiceEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create invoice with auto-generated number and IVA', async () => {
            repo.count.mockResolvedValue(0); // First invoice
            repo.create.mockReturnValue(mockInvoice);
            repo.save.mockResolvedValue(mockInvoice);

            const result = await service.create(tenantId, userId, {
                tutorId: 'tutor-uuid-1',
                tutorName: 'João Silva',
                items: [
                    { description: 'Consulta geral', quantity: 1, unitPrice: 10000, total: 0 },
                    { description: 'Vacina antirrábica', quantity: 1, unitPrice: 5000, total: 0 },
                ],
            });

            expect(repo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    tenantId,
                    invoiceNumber: expect.stringContaining('FAT-'),
                    subtotal: 15000,
                    tax: 2100, // 14% of 15000
                    total: 17100,
                    status: 'DRAFT',
                }),
            );
            expect(result).toBeDefined();
        });

        it('should reject invoice with no items', async () => {
            await expect(
                service.create(tenantId, userId, {
                    tutorId: 'tutor-uuid-1',
                    tutorName: 'João Silva',
                    items: [],
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should accept custom tax rate', async () => {
            repo.count.mockResolvedValue(5);
            repo.create.mockReturnValue(mockInvoice);
            repo.save.mockResolvedValue(mockInvoice);

            await service.create(tenantId, userId, {
                tutorId: 'tutor-uuid-1',
                tutorName: 'Ana Santos',
                items: [
                    { description: 'Cirurgia', quantity: 1, unitPrice: 100000, total: 0 },
                ],
                taxRate: 0, // Tax exempt
            });

            expect(repo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    subtotal: 100000,
                    tax: 0,
                    total: 100000,
                }),
            );
        });
    });

    describe('findAll', () => {
        it('should return paginated invoices', async () => {
            repo.findAndCount.mockResolvedValue([[mockInvoice], 1]);

            const result = await service.findAll(tenantId, { page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });

        it('should filter by status', async () => {
            repo.findAndCount.mockResolvedValue([[], 0]);

            await service.findAll(tenantId, { page: 1, limit: 10, status: 'PAID' });

            expect(repo.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: 'PAID' }),
                }),
            );
        });
    });

    describe('findById', () => {
        it('should return invoice', async () => {
            repo.findOne.mockResolvedValue(mockInvoice);

            const result = await service.findById(tenantId, 'inv-uuid-1');
            expect(result.invoiceNumber).toBe('FAT-2025-000001');
        });

        it('should throw NotFoundException', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(
                service.findById(tenantId, 'nonexistent'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('markAsPaid', () => {
        it('should mark invoice as paid and link payment', async () => {
            repo.findOne.mockResolvedValue({ ...mockInvoice });
            repo.save.mockResolvedValue({ ...mockInvoice, status: 'PAID' });

            const result = await service.markAsPaid(tenantId, 'inv-uuid-1', 'pay-uuid-1');

            expect(repo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'PAID',
                    paymentId: 'pay-uuid-1',
                    paidAt: expect.any(Date),
                }),
            );
        });

        it('should reject paying a cancelled invoice', async () => {
            repo.findOne.mockResolvedValue({ ...mockInvoice, status: 'CANCELLED' });

            await expect(
                service.markAsPaid(tenantId, 'inv-uuid-1', 'pay-uuid-1'),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('cancel', () => {
        it('should cancel a draft invoice', async () => {
            repo.findOne.mockResolvedValue({ ...mockInvoice });
            repo.save.mockResolvedValue({ ...mockInvoice, status: 'CANCELLED' });

            const result = await service.cancel(tenantId, 'inv-uuid-1', 'Erro de dados');

            expect(repo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'CANCELLED',
                    cancellationReason: 'Erro de dados',
                }),
            );
        });

        it('should reject cancelling a paid invoice', async () => {
            repo.findOne.mockResolvedValue({ ...mockInvoice, status: 'PAID' });

            await expect(
                service.cancel(tenantId, 'inv-uuid-1'),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('send', () => {
        it('should send a draft invoice', async () => {
            repo.findOne.mockResolvedValue({ ...mockInvoice, status: 'DRAFT' });
            repo.save.mockResolvedValue({ ...mockInvoice, status: 'SENT' });

            const result = await service.send(tenantId, 'inv-uuid-1');

            expect(repo.save).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'SENT' }),
            );
        });

        it('should reject sending a non-draft invoice', async () => {
            repo.findOne.mockResolvedValue({ ...mockInvoice, status: 'SENT' });

            await expect(
                service.send(tenantId, 'inv-uuid-1'),
            ).rejects.toThrow(BadRequestException);
        });
    });
});
