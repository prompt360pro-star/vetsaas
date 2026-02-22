import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExportService } from './export.service';
import { AnimalEntity } from '../animals/animal.entity';
import { PaymentEntity } from '../payments/payment.entity';
import { AuditLogEntity } from './audit-log.entity';

describe('ExportService', () => {
    let service: ExportService;

    const mockAnimalsRepo = { find: jest.fn() };
    const mockPaymentsRepo = { find: jest.fn() };
    const mockAuditRepo = { find: jest.fn() };

    const tenantId = 'tenant-1';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExportService,
                { provide: getRepositoryToken(AnimalEntity), useValue: mockAnimalsRepo },
                { provide: getRepositoryToken(PaymentEntity), useValue: mockPaymentsRepo },
                { provide: getRepositoryToken(AuditLogEntity), useValue: mockAuditRepo },
            ],
        }).compile();

        service = module.get<ExportService>(ExportService);
        jest.clearAllMocks();
    });

    describe('exportAnimals', () => {
        it('should generate CSV with header and rows', async () => {
            mockAnimalsRepo.find.mockResolvedValue([
                {
                    name: 'Rex',
                    species: 'Cão',
                    breed: 'Pastor Alemão',
                    sex: 'MALE',
                    weight: 30,
                    weightUnit: 'kg',
                    microchipId: '123456789012345',
                    isNeutered: true,
                    createdAt: new Date('2025-01-15T10:00:00Z'),
                },
            ]);

            const csv = await service.exportAnimals(tenantId);
            const lines = csv.split('\n');

            expect(lines[0]).toContain('Nome,Espécie');
            expect(lines[1]).toContain('Rex');
            expect(lines[1]).toContain('Pastor Alemão');
            expect(lines[1]).toContain('Sim');
        });

        it('should handle empty data', async () => {
            mockAnimalsRepo.find.mockResolvedValue([]);
            const csv = await service.exportAnimals(tenantId);
            const lines = csv.split('\n');
            expect(lines).toHaveLength(1); // header only
        });

        it('should escape commas in fields', async () => {
            mockAnimalsRepo.find.mockResolvedValue([
                {
                    name: 'Rex, Jr.',
                    species: 'Cão',
                    breed: '',
                    sex: 'MALE',
                    weight: null,
                    weightUnit: 'kg',
                    microchipId: null,
                    isNeutered: false,
                    createdAt: new Date('2025-01-15'),
                },
            ]);
            const csv = await service.exportAnimals(tenantId);
            expect(csv).toContain('"Rex, Jr."');
        });
    });

    describe('exportPayments', () => {
        it('should generate payment CSV', async () => {
            mockPaymentsRepo.find.mockResolvedValue([
                {
                    createdAt: new Date('2025-02-10'),
                    amount: 15000,
                    currency: 'AOA',
                    method: 'CASH',
                    status: 'COMPLETED',
                    referenceCode: 'PAY-001',
                    description: 'Consulta',
                },
            ]);
            const csv = await service.exportPayments(tenantId);
            expect(csv).toContain('15000');
            expect(csv).toContain('CASH');
        });
    });

    describe('exportAudit', () => {
        it('should generate audit CSV with cap', async () => {
            mockAuditRepo.find.mockResolvedValue([
                {
                    createdAt: new Date('2025-02-10'),
                    userId: 'user-1',
                    action: 'CREATE',
                    entityType: 'animal',
                    entityId: 'a-1',
                },
            ]);
            const csv = await service.exportAudit(tenantId, 10);
            expect(csv).toContain('CREATE');
            expect(csv).toContain('animal');
        });
    });
});
