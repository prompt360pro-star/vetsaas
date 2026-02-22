// ============================================================================
// Payment Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { InvoicesService } from "./invoices.service";
import { InvoiceEntity, InvoiceStatus } from "./invoice.entity";
import { PaymentEntity, PaymentMethod, PaymentStatus } from "./payment.entity";
// import { UserEntity } from "../auth/user.entity";

describe("InvoicesService", () => {
  let service: InvoicesService;
  let invoiceRepo: any;
  let paymentRepo: any;

  const tenantId = "tenant-uuid-1";
  const userId = "user-uuid-1";

  // const mockUser = {
  //   id: userId,
  //   name: "Dr. Silva",
  // } as UserEntity;

  const mockInvoice: Partial<InvoiceEntity> = {
    id: "invoice-uuid-1",
    tenantId,
    amount: 15000,
    paidAmount: 0,
    status: InvoiceStatus.PENDING,
    description: "Consulta Geral",
    createdAt: new Date(),
    dueDate: new Date(),
    items: [],
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
            find: jest.fn(),
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[mockInvoice], 1]),
            }),
          },
        },
        {
          provide: getRepositoryToken(PaymentEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    invoiceRepo = module.get(getRepositoryToken(InvoiceEntity));
    paymentRepo = module.get(getRepositoryToken(PaymentEntity));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new invoice", async () => {
      invoiceRepo.create.mockReturnValue(mockInvoice);
      invoiceRepo.save.mockResolvedValue(mockInvoice);

      const result = await service.create(tenantId, userId, {
        amount: 15000,
        description: "Consulta",
        dueDate: "2024-12-31",
        items: [],
      });

      expect(invoiceRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("registerPayment", () => {
    it("should register partial payment", async () => {
      const invoice = { ...mockInvoice };
      invoiceRepo.findOne.mockResolvedValue(invoice);
      invoiceRepo.save.mockImplementation((inv: any) => Promise.resolve(inv));

      const payment = { id: "pay-1", amount: 5000 };
      paymentRepo.create.mockReturnValue(payment);
      paymentRepo.save.mockResolvedValue(payment);

      const result = await service.registerPayment(
        tenantId,
        userId,
        "invoice-uuid-1",
        {
          amount: 5000,
          method: PaymentMethod.CASH,
        },
      );

      expect(invoice.paidAmount).toBe(5000);
      expect(invoice.status).toBe(InvoiceStatus.PARTIAL);
      expect(result.status).toBe(InvoiceStatus.PARTIAL);
    });

    it("should register full payment", async () => {
      const invoice = { ...mockInvoice };
      invoiceRepo.findOne.mockResolvedValue(invoice);
      invoiceRepo.save.mockImplementation((inv: any) => Promise.resolve(inv));

      const payment = { id: "pay-2", amount: 15000 };
      paymentRepo.create.mockReturnValue(payment);
      paymentRepo.save.mockResolvedValue(payment);

      const result = await service.registerPayment(
        tenantId,
        userId,
        "invoice-uuid-1",
        {
          amount: 15000,
          method: PaymentMethod.MULTICAIXA,
        },
      );

      expect(invoice.paidAmount).toBe(15000);
      expect(invoice.status).toBe(InvoiceStatus.PAID);
      expect(result.status).toBe(InvoiceStatus.PAID);
    });

    it("should throw NotFoundException if invoice not found", async () => {
      invoiceRepo.findOne.mockResolvedValue(null);
      await expect(
        service.registerPayment(tenantId, userId, "inv-x", {
          amount: 100,
          method: PaymentMethod.CASH,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("cancel", () => {
    it("should cancel invoice", async () => {
      const invoice = { ...mockInvoice };
      invoiceRepo.findOne.mockResolvedValue(invoice);
      invoiceRepo.save.mockImplementation((inv: any) => Promise.resolve(inv));

      const result = await service.cancel(tenantId, "invoice-uuid-1", "Erro");

      expect(invoice.status).toBe(InvoiceStatus.CANCELLED);
      expect(result.status).toBe(InvoiceStatus.CANCELLED);
    });
  });

  describe("refund", () => {
    it("should refund payment", async () => {
      // 1. Setup invoice with a payment
      const invoice = {
        ...mockInvoice,
        status: InvoiceStatus.PAID,
        paidAmount: 15000,
      };
      const payment = {
        id: "pay-1",
        amount: 15000,
        status: PaymentStatus.COMPLETED,
        invoice,
      };

      invoiceRepo.findOne.mockResolvedValue(invoice);
      paymentRepo.find.mockResolvedValue([payment]);
      // Mock finding the specific payment to refund
      paymentRepo.findOne = jest.fn().mockResolvedValue(payment);
      paymentRepo.save.mockImplementation((p: any) => Promise.resolve(p));
      invoiceRepo.save.mockImplementation((inv: any) => Promise.resolve(inv));

      await service.refundPayment(
        tenantId,
        userId,
        "invoice-uuid-1",
        "pay-1",
        "Erro cobrança",
      );

      expect(payment.status).toBe(PaymentStatus.REFUNDED);
      expect(invoice.paidAmount).toBe(0);
      expect(invoice.status).toBe(InvoiceStatus.PENDING);
    });
  });

  describe("generateReceipt", () => {
    it("should generate receipt data for paid invoice", async () => {
      const invoice = {
        ...mockInvoice,
        status: InvoiceStatus.PAID,
        customer: { name: "Cliente Teste" },
        payments: [{ amount: 15000, date: new Date() }],
      };
      invoiceRepo.findOne.mockResolvedValue(invoice);

      await service.generateReceipt(tenantId, "invoice-uuid-1");
      // For now, this just returns the object, later it might return PDF buffer
      expect(invoiceRepo.findOne).toHaveBeenCalled();
    });
  });

  describe("sendReceipt", () => {
    it("should simulate sending receipt", async () => {
      const invoice = {
        ...mockInvoice,
        status: InvoiceStatus.PAID,
        customer: { email: "teste@email.com" },
      };
      invoiceRepo.findOne.mockResolvedValue(invoice);

      await service.sendReceipt(tenantId, "invoice-uuid-1");
      // Stub implementation just logs
      expect(invoiceRepo.findOne).toHaveBeenCalled();
    });
  });
});
