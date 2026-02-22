import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

describe('AuditController', () => {
  let controller: AuditController;
  let auditService: AuditService;

  const mockAuditService = {
    findByTenant: jest.fn(),
    findByEntity: jest.fn(),
  };

  const mockUser = { tenantId: 'tenant-1', id: 'user-1' };
  const mockReq = { user: mockUser };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    controller = module.get<AuditController>(AuditController);
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should call auditService.findByTenant with correct parameters', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockAuditService.findByTenant.mockResolvedValue(result);

      const query = {
        entityType: 'test-entity',
        action: 'create',
        userId: 'user-123',
        from: '2023-01-01',
        to: '2023-01-31',
        page: '2',
        limit: '50',
      };

      const response = await controller.list(
        mockReq,
        query.entityType,
        query.action,
        query.userId,
        query.from,
        query.to,
        query.page,
        query.limit,
      );

      expect(auditService.findByTenant).toHaveBeenCalledWith(mockUser.tenantId, {
        entityType: query.entityType,
        action: query.action,
        userId: query.userId,
        from: new Date(query.from),
        to: new Date(query.to),
        page: 2,
        limit: 50,
      });
      expect(response).toBe(result);
    });

    it('should handle undefined query parameters', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      mockAuditService.findByTenant.mockResolvedValue(result);

      await controller.list(mockReq);

      expect(auditService.findByTenant).toHaveBeenCalledWith(mockUser.tenantId, {
        entityType: undefined,
        action: undefined,
        userId: undefined,
        from: undefined,
        to: undefined,
        page: undefined,
        limit: undefined,
      });
    });
  });

  describe('entityHistory', () => {
    it('should call auditService.findByEntity with correct parameters', async () => {
      const result = [{ id: '1', action: 'create' }];
      mockAuditService.findByEntity.mockResolvedValue(result);

      const entityType = 'animal';
      const entityId = '123';

      const response = await controller.entityHistory(mockReq, entityType, entityId);

      expect(auditService.findByEntity).toHaveBeenCalledWith(
        mockUser.tenantId,
        entityType,
        entityId,
      );
      expect(response).toBe(result);
    });
  });
});
