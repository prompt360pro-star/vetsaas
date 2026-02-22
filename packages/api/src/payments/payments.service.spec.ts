// ============================================================================
// Payment Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { PaymentsService } from "./payments.service";
import { PaymentEntity, PaymentMethod, PaymentStatus } from "./payment.entity";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let repo: any;

  const tenantId = "tenant-uuid-1";
  const userId = "user-uuid-1";

  const mockPayment: Partial<PaymentEntity> = {
    id: "payment-uuid-1",
    tenantId,
    amount: 5000,
    currency: "AOA",
    method: PaymentMethod.MULTICAIXA_EXPRESS,
    gateway: "UNITEL_MONEY",
    status: PaymentStatus.PENDING,
    referenceCode: "REF123",
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(PaymentEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({}),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    repo = module.get(getRepositoryToken(PaymentEntity));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a payment", async () => {
      repo.create.mockReturnValue(mockPayment);
      repo.save.mockResolvedValue(mockPayment);

      const result = await service.create(tenantId, userId, {
        amount: 5000,
        method: "UNITEL_MONEY",
      });

      expect(repo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("findAll", () => {
    it("should return paginated payments", async () => {
      repo.findAndCount.mockResolvedValue([[mockPayment], 1]);

      const result = await service.findAll(tenantId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
