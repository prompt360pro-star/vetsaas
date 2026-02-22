// ============================================================================
// Payments Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentEntity } from "./payment.entity";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let repo: any;

  const tenantId = "tenant-uuid-1";
  const userId = "user-uuid-1";

  const mockPayment: Partial<PaymentEntity> = {
    id: "pay-uuid-1",
    tenantId,
    amount: 15000,
    currency: "AOA",
    method: "MULTICAIXA_EXPRESS",
    gateway: "MANUAL",
    status: "PENDING",
    referenceCode: "000001234567890",
    createdAt: new Date(),
    updatedAt: new Date(),
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
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({
                count: "5",
                totalRevenue: "75000",
                totalCompleted: "45000",
                totalPending: "30000",
                totalFailed: "0",
              }),
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
    it("should create a pending payment with reference", async () => {
      repo.create.mockReturnValue(mockPayment);
      repo.save.mockResolvedValue(mockPayment);

      const result = await service.create(tenantId, userId, {
        amount: 15000,
        method: "MULTICAIXA_EXPRESS",
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId,
          amount: 15000,
          method: "MULTICAIXA_EXPRESS",
          status: "PENDING",
          createdBy: userId,
        }),
      );
      expect(result).toBeDefined();
    });

    it("should auto-complete cash payments", async () => {
      const cashPayment = {
        ...mockPayment,
        method: "CASH",
        status: "COMPLETED",
      };
      repo.create.mockReturnValue(cashPayment);
      repo.save.mockResolvedValue(cashPayment);

      await service.create(tenantId, userId, {
        amount: 5000,
        method: "CASH",
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "COMPLETED",
          paidAt: expect.any(Date),
        }),
      );
    });

    it("should generate Multicaixa reference for reference payments", async () => {
      repo.create.mockReturnValue(mockPayment);
      repo.save.mockResolvedValue(mockPayment);

      await service.create(tenantId, userId, {
        amount: 25000,
        method: "MULTICAIXA_REFERENCE",
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          referenceCode: expect.any(String),
        }),
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated payments for tenant", async () => {
      repo.findAndCount.mockResolvedValue([[mockPayment], 1]);

      const result = await service.findAll(tenantId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId }),
        }),
      );
    });

    it("should filter by status", async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(tenantId, {
        page: 1,
        limit: 10,
        status: "COMPLETED",
      });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId, status: "COMPLETED" }),
        }),
      );
    });
  });

  describe("findById", () => {
    it("should return payment by id", async () => {
      repo.findOne.mockResolvedValue(mockPayment);

      const result = await service.findById(tenantId, "pay-uuid-1");
      expect(result).toEqual(mockPayment);
    });

    it("should throw NotFoundException", async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById(tenantId, "nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getSummary", () => {
    it("should return aggregated financial summary", async () => {
      const result = await service.getSummary(tenantId);

      expect(result.totalRevenue).toBe(75000);
      expect(result.totalCompleted).toBe(45000);
      expect(result.totalPending).toBe(30000);
      expect(result.averageTicket).toBe(15000); // 75000 / 5
      expect(result.count).toBe(5);
    });
  });

  describe("processWebhook", () => {
    describe("MULTICAIXA_GPO", () => {
      it("should mark payment as completed on success webhook", async () => {
        repo.findOne.mockResolvedValue({ ...mockPayment, status: "PENDING" });
        repo.save.mockResolvedValue({ ...mockPayment, status: "COMPLETED" });

        await service.processWebhook("MULTICAIXA_GPO", {
          reference: "000001234567890",
          transactionId: "txn_mc_123",
          status: "00",
        });

        expect(repo.save).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "COMPLETED",
            gateway: "MULTICAIXA_GPO",
            paidAt: expect.any(Date),
          }),
        );
      });

      it("should mark payment as failed on failure webhook", async () => {
        repo.findOne.mockResolvedValue({ ...mockPayment, status: "PENDING" });
        repo.save.mockResolvedValue({ ...mockPayment, status: "FAILED" });

        await service.processWebhook("MULTICAIXA_GPO", {
          reference: "000001234567890",
          transactionId: "txn_mc_123",
          status: "99",
        });

        expect(repo.save).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "FAILED",
            failureReason: "Gateway status: 99",
            failedAt: expect.any(Date),
          }),
        );
      });

      it("should handle missing reference gracefully", async () => {
        await expect(
          service.processWebhook("MULTICAIXA_GPO", {}),
        ).resolves.not.toThrow();
      });
    });

    describe("UNITEL_MONEY", () => {
      it("should mark payment as completed on PAID status", async () => {
        repo.findOne.mockResolvedValue({ ...mockPayment, status: "PENDING" });
        repo.save.mockResolvedValue({ ...mockPayment, status: "COMPLETED" });

        await service.processWebhook("UNITEL_MONEY", {
          reference_id: "000001234567890",
          transaction_id: "txn_um_123",
          status: "PAID",
        });

        expect(repo.save).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "COMPLETED",
            gateway: "UNITEL_MONEY",
            paidAt: expect.any(Date),
          }),
        );
      });

      it("should mark payment as failed on FAILED status", async () => {
        repo.findOne.mockResolvedValue({ ...mockPayment, status: "PENDING" });
        repo.save.mockResolvedValue({ ...mockPayment, status: "FAILED" });

        await service.processWebhook("UNITEL_MONEY", {
          reference_id: "000001234567890",
          transaction_id: "txn_um_123",
          status: "FAILED",
        });

        expect(repo.save).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "FAILED",
            gateway: "UNITEL_MONEY",
            failedAt: expect.any(Date),
          }),
        );
      });
    });

    describe("Generic/Fallback", () => {
      it("should handle unknown gateway with generic handler", async () => {
        repo.findOne.mockResolvedValue({ ...mockPayment, status: "PENDING" });
        repo.save.mockResolvedValue({ ...mockPayment, status: "COMPLETED" });

        await service.processWebhook("UNKNOWN_GATEWAY", {
          referenceCode: "000001234567890",
          transactionId: "txn_generic_123",
        });

        expect(repo.save).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "COMPLETED",
            paidAt: expect.any(Date),
          }),
        );
      });
    });
  });
});
