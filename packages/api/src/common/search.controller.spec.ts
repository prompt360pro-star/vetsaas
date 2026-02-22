import { Test, TestingModule } from "@nestjs/testing";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

describe("SearchController", () => {
  let controller: SearchController;
  let service: SearchService;

  const mockSearchService = {
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get<SearchService>(SearchService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("search", () => {
    it("should call searchService.search with correct parameters and return result", async () => {
      const mockResult = {
        query: "test",
        total: 1,
        results: [
          {
            type: "animal" as const,
            id: "1",
            title: "Test Animal",
            subtitle: "Dog",
            icon: "🐾",
          },
        ],
      };
      mockSearchService.search.mockResolvedValue(mockResult);

      const req = { user: { tenantId: "tenant-1" } };
      const query = "test";

      const result = await controller.search(req, query);

      expect(service.search).toHaveBeenCalledWith("tenant-1", "test");
      expect(result).toEqual({ success: true, data: mockResult });
    });

    it("should handle empty query string", async () => {
      const mockResult = {
        query: "",
        total: 0,
        results: [],
      };
      mockSearchService.search.mockResolvedValue(mockResult);

      const req = { user: { tenantId: "tenant-1" } };
      const query = "";

      const result = await controller.search(req, query);

      expect(service.search).toHaveBeenCalledWith("tenant-1", "");
      expect(result).toEqual({ success: true, data: mockResult });
    });
  });
});
