// ============================================================================
// Animals Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AnimalsService } from './animals.service';
import { AnimalEntity } from './animal.entity';

describe('AnimalsService', () => {
  let service: AnimalsService;
  let repo: any;

  const tenantId = 'tenant-uuid-1';

  const mockAnimal: Partial<AnimalEntity> = {
    id: 'animal-uuid-1',
    name: 'Rex',
    species: 'CANINE',
    breed: 'Pastor Alemão',
    sex: 'M',
    dateOfBirth: new Date('2020-03-15'),
    weight: 32.5,
    microchipId: '123456789012345',
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnimalsService,
        {
          provide: getRepositoryToken(AnimalEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            findAndCount: jest.fn(),
            softRemove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnimalsService>(AnimalsService);
    repo = module.get(getRepositoryToken(AnimalEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated animals for the given tenant', async () => {
      const animals = [
        mockAnimal,
        { ...mockAnimal, id: 'animal-uuid-2', name: 'Bolt' },
      ];
      repo.findAndCount.mockResolvedValue([animals, 2]);

      const result = await service.findAll(tenantId, { page: 1, limit: 20 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId }),
        }),
      );
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should scope queries to tenant', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll('different-tenant', { page: 1, limit: 20 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'different-tenant' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return animal with matching id and tenant', async () => {
      repo.findOne.mockResolvedValue(mockAnimal);

      const result = await service.findById(tenantId, 'animal-uuid-1');

      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'animal-uuid-1', tenantId },
        }),
      );
      expect(result).toEqual(mockAnimal);
    });

    it('should throw NotFoundException for missing animal', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create animal with tenant and user isolation', async () => {
      const dto: Partial<AnimalEntity> = {
        name: 'Luna',
        species: 'FELINE',
        breed: 'Persa',
        sex: 'F',
      };
      const userId = 'user-uuid-1';

      repo.create.mockReturnValue({ ...dto, tenantId, createdBy: userId });
      repo.save.mockResolvedValue({
        ...dto,
        id: 'new-uuid',
        tenantId,
        createdBy: userId,
      });

      const result = await service.create(tenantId, userId, dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId, createdBy: userId }),
      );
      expect(result.tenantId).toBe(tenantId);
    });
  });

  describe('countByTenant', () => {
    it('should return count for tenant', async () => {
      repo.count.mockResolvedValue(42);

      const result = await service.countByTenant(tenantId);

      expect(result).toBe(42);
      expect(repo.count).toHaveBeenCalledWith({ where: { tenantId } });
    });
  });
});
