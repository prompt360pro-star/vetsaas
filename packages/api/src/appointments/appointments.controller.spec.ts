import { Test, TestingModule } from "@nestjs/testing";
import { AppointmentsController } from "./appointments.controller";
import { AppointmentsService } from "./appointments.service";

describe("AppointmentsController", () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;

  const mockAppointmentsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: mockAppointmentsService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated appointments", async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      mockAppointmentsService.findAll.mockResolvedValue(mockResult);

      const req = { user: { tenantId: "tenant-1" } };
      const query: any = { page: 1, limit: 10 };

      const result = await controller.findAll(req, query);

      expect(service.findAll).toHaveBeenCalledWith("tenant-1", query);
      expect(result).toEqual({ success: true, data: mockResult });
    });
  });

  describe("findById", () => {
    it("should return a single appointment", async () => {
      const mockResult = { id: "app-1" };
      mockAppointmentsService.findById.mockResolvedValue(mockResult);

      const req = { user: { tenantId: "tenant-1" } };
      const id = "app-1";

      const result = await controller.findById(req, id);

      expect(service.findById).toHaveBeenCalledWith("tenant-1", id);
      expect(result).toEqual({ success: true, data: mockResult });
    });
  });

  describe("create", () => {
    it("should create a new appointment", async () => {
      const mockResult = { id: "app-1" };
      mockAppointmentsService.create.mockResolvedValue(mockResult);

      const req = { user: { tenantId: "tenant-1", sub: "user-1" } };
      const body = { date: "2023-01-01" };

      const result = await controller.create(req, body);

      expect(service.create).toHaveBeenCalledWith("tenant-1", "user-1", body);
      expect(result).toEqual({ success: true, data: mockResult });
    });
  });

  describe("update", () => {
    it("should update an appointment", async () => {
      const mockResult = { id: "app-1", updated: true };
      mockAppointmentsService.update.mockResolvedValue(mockResult);

      const req = { user: { tenantId: "tenant-1" } };
      const id = "app-1";
      const body = { status: "CONFIRMED" };

      const result = await controller.update(req, id, body);

      expect(service.update).toHaveBeenCalledWith("tenant-1", id, body);
      expect(result).toEqual({ success: true, data: mockResult });
    });
  });

  describe("updateStatus", () => {
    it("should update appointment status", async () => {
      const mockResult = { id: "app-1", status: "CANCELLED" };
      mockAppointmentsService.updateStatus.mockResolvedValue(mockResult);

      const req = { user: { tenantId: "tenant-1" } };
      const id = "app-1";
      const status = "CANCELLED";

      const result = await controller.updateStatus(req, id, status);

      expect(service.updateStatus).toHaveBeenCalledWith("tenant-1", id, status);
      expect(result).toEqual({ success: true, data: mockResult });
    });
  });
});
