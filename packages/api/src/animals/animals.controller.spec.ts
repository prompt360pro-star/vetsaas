import { Test, TestingModule } from "@nestjs/testing";
import { AnimalsController } from "./animals.controller";
import { AnimalsService } from "./animals.service";

describe("AnimalsController", () => {
  let controller: AnimalsController;
  let service: AnimalsService;

  const mockAnimalsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      tenantId: "tenant-id",
      sub: "user-id",
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnimalsController],
      providers: [
        {
          provide: AnimalsService,
          useValue: mockAnimalsService,
        },
      ],
    }).compile();

    controller = module.get<AnimalsController>(AnimalsController);
    service = module.get<AnimalsService>(AnimalsService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return a list of animals", async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      mockAnimalsService.findAll.mockResolvedValue(result);

      const query = { page: 1, limit: 10 };
      expect(await controller.findAll(mockRequest, query)).toEqual({
        success: true,
        data: result,
      });
      expect(service.findAll).toHaveBeenCalledWith("tenant-id", query);
    });
  });

  describe("findById", () => {
    it("should return a single animal", async () => {
      const result = { id: "animal-id", name: "Rex" };
      mockAnimalsService.findById.mockResolvedValue(result);

      expect(await controller.findById(mockRequest, "animal-id")).toEqual({
        success: true,
        data: result,
      });
      expect(service.findById).toHaveBeenCalledWith("tenant-id", "animal-id");
    });
  });

  describe("create", () => {
    it("should create a new animal", async () => {
      const body = { name: "Rex" };
      const result = { id: "animal-id", ...body };
      mockAnimalsService.create.mockResolvedValue(result);

      expect(await controller.create(mockRequest, body)).toEqual({
        success: true,
        data: result,
      });
      expect(service.create).toHaveBeenCalledWith("tenant-id", "user-id", body);
    });
  });

  describe("update", () => {
    it("should update an animal", async () => {
      const body = { name: "Rex Updated" };
      const result = { id: "animal-id", ...body };
      mockAnimalsService.update.mockResolvedValue(result);

      expect(await controller.update(mockRequest, "animal-id", body)).toEqual({
        success: true,
        data: result,
      });
      expect(service.update).toHaveBeenCalledWith(
        "tenant-id",
        "animal-id",
        body,
      );
    });
  });

  describe("remove", () => {
    it("should remove an animal", async () => {
      mockAnimalsService.remove.mockResolvedValue(undefined);

      expect(await controller.remove(mockRequest, "animal-id")).toEqual({
        success: true,
        message: "Animal removed",
      });
      expect(service.remove).toHaveBeenCalledWith("tenant-id", "animal-id");
    });
  });
});
