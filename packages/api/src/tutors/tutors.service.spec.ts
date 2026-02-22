import { Test, TestingModule } from '@nestjs/testing';
import { TutorsService } from './tutors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TutorEntity } from './tutor.entity';
import { Repository, ILike } from 'typeorm';

const mockRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
};

describe('TutorsService', () => {
  let service: TutorsService;
  let repo: Repository<TutorEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorsService,
        {
          provide: getRepositoryToken(TutorEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<TutorsService>(TutorsService);
    repo = module.get<Repository<TutorEntity>>(getRepositoryToken(TutorEntity));

    // Clear mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should call repository with correct parameters', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      const tenantId = 'tenant-1';
      const query = { page: 1, limit: 10 };

      await service.findAll(tenantId, query);

      expect(mockRepo.findAndCount).toHaveBeenCalledWith({
        where: { tenantId },
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });

    it('should use prefix search when search query is provided', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      const tenantId = 'tenant-1';
      const query = { search: 'John' };

      await service.findAll(tenantId, query);

      // Verify findAndCount was called
      expect(mockRepo.findAndCount).toHaveBeenCalled();

      // Get the arguments passed to findAndCount
      const args = mockRepo.findAndCount.mock.calls[0][0];

      // Verify where clause structure
      expect(args.where).toHaveProperty('tenantId', tenantId);
      expect(args.where).toHaveProperty('firstName');

      // We can't easily compare FindOperator equality, but we can verify it exists
      // The implementation uses ILike(`${query.search}%`)
      // which creates a FindOperator('ilike', 'John%')
      const firstNameOperator = args.where.firstName;
      expect(firstNameOperator.type).toBe('ilike');
      expect(firstNameOperator.value).toBe('John%');
    });
  });
});
