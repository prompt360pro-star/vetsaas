// ============================================================================
// Payment Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { InvoicesService, CreateInvoiceInput } from "./invoices.service";
import { InvoiceEntity, InvoiceStatus } from "./invoice.entity";
import { PaymentEntity } from "./payment.entity";

describe("InvoicesService", () => {
  let service: InvoicesService;
  let invoiceRepo: any;
  let paymentRepo: any;

  const tenantId = "tenant-uuid-1";
  const userId = "user-uuid-1";

  const mockInvoice: Partial<InvoiceEntity> = {
    id: "invoice-uuid-1",
    tenantId,
    total: 15000,
    paidAmount: 0,
    status: InvoiceStatus.PENDING,
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

      const input: CreateInvoiceInput = {
        tutorId: "tutor-1",
        tutorName: "John Doe",
        items: [{
          description: "Consultation",
          quantity: 1,
          unitPrice: 15000,
          total: 15000
        }]
      };

      const result = await service.create(tenantId, userId, input);

      expect(invoiceRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
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
});
