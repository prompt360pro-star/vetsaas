import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClinicalAlertsService } from './clinical-alerts.service';
import { ClinicalRecordEntity } from './clinical-record.entity';
import { InventoryItemEntity } from '../inventory/inventory-item.entity';

describe('ClinicalAlertsService', () => {
  let service: ClinicalAlertsService;

  const mockRecordsRepo = {
    find: jest.fn(),
  };

  const mockInventoryRepo = {
    createQueryBuilder: jest.fn(),
  };

  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalAlertsService,
        {
          provide: getRepositoryToken(ClinicalRecordEntity),
          useValue: mockRecordsRepo,
        },
        {
          provide: getRepositoryToken(InventoryItemEntity),
          useValue: mockInventoryRepo,
        },
      ],
    }).compile();

    service = module.get<ClinicalAlertsService>(ClinicalAlertsService);
    jest.clearAllMocks();
  });

  describe('checkUnsignedRecords', () => {
    it('should return alerts for unsigned records older than 24h', async () => {
      const oldRecord = {
        id: 'r-1',
        tenantId,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      };
      mockRecordsRepo.find.mockResolvedValue([oldRecord]);

      const alerts = await service.checkUnsignedRecords(tenantId);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('WARNING');
      expect(alerts[0].category).toBe('UNSIGNED_RECORD');
      expect(alerts[0].entityId).toBe('r-1');
    });

    it('should return empty if no unsigned records', async () => {
      mockRecordsRepo.find.mockResolvedValue([]);
      const alerts = await service.checkUnsignedRecords(tenantId);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('checkLowInventory', () => {
    it('should return DANGER for zero stock', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'inv-1',
            name: 'Amoxicilina',
            stock: 0,
            minStock: 10,
            unit: 'un',
            isActive: true,
          },
        ]),
      };
      mockInventoryRepo.createQueryBuilder.mockReturnValue(qb);

      const alerts = await service.checkLowInventory(tenantId);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('DANGER');
      expect(alerts[0].title).toBe('Stock esgotado');
    });

    it('should return WARNING for low but non-zero stock', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'inv-2',
            name: 'Seringa',
            stock: 3,
            minStock: 10,
            unit: 'un',
            isActive: true,
          },
        ]),
      };
      mockInventoryRepo.createQueryBuilder.mockReturnValue(qb);

      const alerts = await service.checkLowInventory(tenantId);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('WARNING');
      expect(alerts[0].title).toBe('Stock baixo');
    });
  });

  describe('checkVitals', () => {
    it('should flag high dog temperature', () => {
      const alerts = service.checkVitals('DOG', { temperature: 40.5 });
      expect(alerts).toHaveLength(1);
      expect(alerts[0].category).toBe('ABNORMAL_VITAL');
      expect(alerts[0].title).toContain('acima');
    });

    it('should flag low cat heart rate', () => {
      const alerts = service.checkVitals('CAT', { heartRate: 100 });
      expect(alerts).toHaveLength(1);
      expect(alerts[0].title).toContain('abaixo');
    });

    it('should return empty for normal vitals', () => {
      const alerts = service.checkVitals('DOG', {
        temperature: 38.5,
        heartRate: 80,
      });
      expect(alerts).toHaveLength(0);
    });

    it('should return empty for unknown species', () => {
      const alerts = service.checkVitals('BIRD', { temperature: 40 });
      expect(alerts).toHaveLength(0);
    });

    it('should flag DANGER for critically high vitals', () => {
      // 39.2 * 1.1 = 43.12, so 44 should be DANGER
      const alerts = service.checkVitals('DOG', { temperature: 44 });
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('DANGER');
    });
  });
});
