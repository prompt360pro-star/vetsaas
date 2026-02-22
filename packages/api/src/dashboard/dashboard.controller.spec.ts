import { Test, TestingModule } from "@nestjs/testing";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

describe("DashboardController", () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getStats: jest.fn(),
    getRecentActivity: jest.fn(),
  };

  const tenantId = "tenant-123";
  const mockRequest = {
    user: {
      tenantId,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("stats", () => {
    it("should call service.getStats with correct tenantId", async () => {
      const mockStats = {
        totalAnimals: 10,
        totalTutors: 5,
        todayAppointments: 2,
        monthlyRevenue: 1000,
        animalsChange: 1,
        tutorsChange: 0,
        appointmentsChange: -1,
        revenueChange: 10,
      };

      mockDashboardService.getStats.mockResolvedValue(mockStats);

      const result = await controller.stats(mockRequest as any);

      expect(service.getStats).toHaveBeenCalledWith(tenantId);
      expect(result).toEqual(mockStats);
    });
  });

  describe("activity", () => {
    it("should call service.getRecentActivity with correct tenantId", async () => {
      const mockActivity = [
        { id: 1, action: "CREATE", entity: "Animal", timestamp: new Date() },
      ];

      mockDashboardService.getRecentActivity.mockResolvedValue(mockActivity);

      const result = await controller.activity(mockRequest as any);

      expect(service.getRecentActivity).toHaveBeenCalledWith(tenantId);
      expect(result).toEqual(mockActivity);
    });
  });
});
