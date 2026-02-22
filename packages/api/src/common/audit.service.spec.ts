import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLogEntity } from './audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const tenantId = 'tenant-1';
  const userId = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getRepositoryToken(AuditLogEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const entry = { id: 'log-1', action: 'CREATE', entityType: 'animal' };
      mockRepo.create.mockReturnValue(entry);
      mockRepo.save.mockResolvedValue(entry);

      const result = await service.log({
        tenantId,
        userId,
        action: 'CREATE',
        entityType: 'animal',
        entityId: 'animal-1',
        newValues: { name: 'Rex' },
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId,
          userId,
          action: 'CREATE',
          entityType: 'animal',
          entityId: 'animal-1',
        }),
      );
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(entry);
    });

    it('should handle optional fields as null', async () => {
      const entry = { id: 'log-2' };
      mockRepo.create.mockReturnValue(entry);
      mockRepo.save.mockResolvedValue(entry);

      await service.log({
        tenantId,
        userId,
        action: 'LOGIN',
        entityType: 'user',
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: null,
          oldValues: null,
          newValues: null,
          ipAddress: null,
          userAgent: null,
        }),
      );
    });
  });

  describe('findByTenant', () => {
    it('should return paginated results', async () => {
      const logs = [{ id: 'log-1' }, { id: 'log-2' }];
      mockRepo.findAndCount.mockResolvedValue([logs, 2]);

      const result = await service.findByTenant(tenantId, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(logs);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by entityType and action', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findByTenant(tenantId, {
        entityType: 'animal',
        action: 'CREATE',
      });

      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId,
            entityType: 'animal',
            action: 'CREATE',
          }),
        }),
      );
    });

    it('should cap limit at 100', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findByTenant(tenantId, { limit: 500 });

      expect(result.limit).toBe(100);
    });

    it('should default page to 1 and limit to 20', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findByTenant(tenantId);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe('findByEntity', () => {
    it('should return entity history', async () => {
      const logs = [{ id: 'log-1', entityType: 'animal', entityId: 'a-1' }];
      mockRepo.find.mockResolvedValue(logs);

      const result = await service.findByEntity(tenantId, 'animal', 'a-1');

      expect(result).toEqual(logs);
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, entityType: 'animal', entityId: 'a-1' },
          order: { createdAt: 'DESC' },
          take: 50,
        }),
      );
    });
  });

  describe('getRecentActivity', () => {
    it('should return last 10 entries by default', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.getRecentActivity(tenantId);

      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          take: 10,
        }),
      );
    });

    it('should accept custom limit', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.getRecentActivity(tenantId, 5);

      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });
});
