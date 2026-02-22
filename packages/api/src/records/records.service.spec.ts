import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RecordsService } from './records.service';
import { ClinicalRecordEntity } from './clinical-record.entity';
import { NotFoundException } from '@nestjs/common';
import type { PaginationQuery } from '@vetsaas/shared';

describe('RecordsService', () => {
    let service: RecordsService;

    const mockRepo = {
        findAndCount: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const tenantId = 'tenant-1';
    const animalId = 'animal-1';
    const recordId = 'record-1';
    const vetId = 'vet-1';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RecordsService,
                {
                    provide: getRepositoryToken(ClinicalRecordEntity),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        service = module.get<RecordsService>(RecordsService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findByAnimal', () => {
        it('should return paginated results', async () => {
            const query: PaginationQuery = { page: 1, limit: 10 };
            const records = [{ id: recordId, tenantId, animalId }];
            const total = 1;
            mockRepo.findAndCount.mockResolvedValue([records, total]);

            const result = await service.findByAnimal(tenantId, animalId, query);

            expect(mockRepo.findAndCount).toHaveBeenCalledWith({
                where: { tenantId, animalId },
                skip: 0,
                take: 10,
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual({
                data: records,
                total,
                page: 1,
                limit: 10,
                totalPages: 1,
            });
        });

        it('should handle default pagination', async () => {
            const query: PaginationQuery = {};
            const records = [];
            const total = 0;
            mockRepo.findAndCount.mockResolvedValue([records, total]);

            const result = await service.findByAnimal(tenantId, animalId, query);

            expect(mockRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0,
                take: 20,
            }));
            expect(result.limit).toBe(20);
            expect(result.page).toBe(1);
        });
    });

    describe('findById', () => {
        it('should return a record if found', async () => {
            const record = { id: recordId, tenantId };
            mockRepo.findOne.mockResolvedValue(record);

            const result = await service.findById(tenantId, recordId);

            expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: recordId, tenantId } });
            expect(result).toEqual(record);
        });

        it('should throw NotFoundException if not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.findById(tenantId, recordId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create and save a new record', async () => {
            const data = { subjective: 'test' };
            const createdRecord = { ...data, tenantId, veterinarianId: vetId };
            const savedRecord = { ...createdRecord, id: recordId };

            mockRepo.create.mockReturnValue(createdRecord);
            mockRepo.save.mockResolvedValue(savedRecord);

            const result = await service.create(tenantId, vetId, data);

            expect(mockRepo.create).toHaveBeenCalledWith({
                ...data,
                tenantId,
                veterinarianId: vetId,
            });
            expect(mockRepo.save).toHaveBeenCalledWith(createdRecord);
            expect(result).toEqual(savedRecord);
        });
    });

    describe('update', () => {
        it('should update record and increment version', async () => {
            const existingRecord = { id: recordId, tenantId, version: 1, subjective: 'old' };
            const updateData = { subjective: 'new' };
            const updatedRecord = { ...existingRecord, ...updateData, version: 2 };

            mockRepo.findOne.mockResolvedValue(existingRecord);
            mockRepo.save.mockResolvedValue(updatedRecord);

            const result = await service.update(tenantId, recordId, updateData);

            expect(mockRepo.findOne).toHaveBeenCalled();
            expect(existingRecord.version).toBe(2);
            expect(existingRecord.subjective).toBe('new');
            expect(mockRepo.save).toHaveBeenCalledWith(existingRecord);
            expect(result).toEqual(updatedRecord);
        });

        it('should throw NotFoundException if record not found', async () => {
             mockRepo.findOne.mockResolvedValue(null);
             await expect(service.update(tenantId, recordId, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('sign', () => {
        it('should sign the record', async () => {
            const existingRecord = { id: recordId, tenantId };
            const userId = 'user-1';

            mockRepo.findOne.mockResolvedValue(existingRecord);
            mockRepo.save.mockImplementation(r => Promise.resolve(r));

            const result = await service.sign(tenantId, recordId, userId);

            expect(mockRepo.findOne).toHaveBeenCalled();
            expect(existingRecord).toHaveProperty('signedAt');
            expect(existingRecord).toHaveProperty('signedBy', userId);
            expect(mockRepo.save).toHaveBeenCalledWith(existingRecord);
        });
    });
});
