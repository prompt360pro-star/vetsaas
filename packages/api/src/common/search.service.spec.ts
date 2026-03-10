import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { SearchService } from "./search.service";
import { AnimalEntity } from "../animals/animal.entity";
import { TutorEntity } from "../tutors/tutor.entity";
import { ClinicalRecordEntity } from "../records/clinical-record.entity";

describe("SearchService", () => {
  let service: SearchService;

  const mockQb = (results: any[]) => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(results),
  });

  const mockAnimalsRepo = { createQueryBuilder: jest.fn() };
  const mockTutorsRepo = { createQueryBuilder: jest.fn() };
  const mockRecordsRepo = { createQueryBuilder: jest.fn() };

  const tenantId = "tenant-1";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(AnimalEntity),
          useValue: mockAnimalsRepo,
        },
        { provide: getRepositoryToken(TutorEntity), useValue: mockTutorsRepo },
        {
          provide: getRepositoryToken(ClinicalRecordEntity),
          useValue: mockRecordsRepo,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    jest.clearAllMocks();
  });

  it("should return empty for short queries", async () => {
    const res = await service.search(tenantId, "a");
    expect(res.total).toBe(0);
    expect(res.results).toHaveLength(0);
  });

  it("should return empty for empty query", async () => {
    const res = await service.search(tenantId, "");
    expect(res.total).toBe(0);
  });

  it("should search across animals, tutors, and records", async () => {
    mockAnimalsRepo.createQueryBuilder.mockReturnValue(
      mockQb([{ id: "a1", name: "Rex", species: "Cão", breed: "Labrador" }]),
    );
    mockTutorsRepo.createQueryBuilder.mockReturnValue(
      mockQb([
        {
          id: "t1",
          firstName: "João",
          lastName: "Silva",
          phone: "+244 912 345 678",
        },
      ]),
    );
    mockRecordsRepo.createQueryBuilder.mockReturnValue(
      mockQb([
        { id: "r1", assessment: "Infecção urinária", createdAt: new Date() },
      ]),
    );

    const res = await service.search(tenantId, "rex");

    expect(res.total).toBe(3);
    expect(res.results[0].type).toBe("animal");
    expect(res.results[0].title).toBe("Rex");
    expect(res.results[1].type).toBe("tutor");
    expect(res.results[2].type).toBe("record");
  });

  it("should return correct icons per type", async () => {
    mockAnimalsRepo.createQueryBuilder.mockReturnValue(
      mockQb([{ id: "a1", name: "Luna", species: "Gato", breed: null }]),
    );
    mockTutorsRepo.createQueryBuilder.mockReturnValue(mockQb([]));
    mockRecordsRepo.createQueryBuilder.mockReturnValue(mockQb([]));

    const res = await service.search(tenantId, "luna");

    expect(res.results[0].icon).toBe("🐾");
    expect(res.results[0].subtitle).toBe("Gato");
  });
});
