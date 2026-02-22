// ============================================================================
// Tutors Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { TutorEntity } from './tutor.entity';

describe('TutorsService', () => {
    let service: TutorsService;
    let repo: any;

    const tenantId = 'tenant-uuid-1';

    const mockTutor: Partial<TutorEntity> = {
        id: 'tutor-uuid-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TutorsService,
                {
                    provide: getRepositoryToken(TutorEntity),
                    useValue: {
                        findAndCount: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        softRemove: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TutorsService>(TutorsService);
        repo = module.get(getRepositoryToken(TutorEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated tutors for the given tenant', async () => {
            const tutors = [mockTutor, { ...mockTutor, id: 'tutor-uuid-2', firstName: 'Jane' }];
            repo.findAndCount.mockResolvedValue([tutors, 2]);

            const result = await service.findAll(tenantId, { page: 1, limit: 20 });

            expect(repo.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ tenantId }),
                    skip: 0,
                    take: 20,
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

        it('should apply search filter', async () => {
            repo.findAndCount.mockResolvedValue([[], 0]);
            const search = 'John';

            await service.findAll(tenantId, { page: 1, limit: 20, search });

            expect(repo.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        tenantId,
                        firstName: expect.anything(), // ILike is hard to match exactly, checking structure
                    }),
                }),
            );
        });
    });

    describe('findById', () => {
        it('should return tutor with matching id and tenant', async () => {
            repo.findOne.mockResolvedValue(mockTutor);

            const result = await service.findById(tenantId, 'tutor-uuid-1');

            expect(repo.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'tutor-uuid-1', tenantId },
                }),
            );
            expect(result).toEqual(mockTutor);
        });

        it('should throw NotFoundException for missing tutor', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(
                service.findById(tenantId, 'nonexistent'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create tutor with tenant and user isolation', async () => {
            const dto: Partial<TutorEntity> = {
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice.smith@example.com',
                phone: '0987654321',
            };
            const userId = 'user-uuid-1';

            repo.create.mockReturnValue({ ...dto, tenantId, createdBy: userId });
            repo.save.mockResolvedValue({ ...dto, id: 'new-uuid', tenantId, createdBy: userId });

            const result = await service.create(tenantId, userId, dto);

            expect(repo.create).toHaveBeenCalledWith(
                expect.objectContaining({ ...dto, tenantId, createdBy: userId }),
            );
            expect(result.tenantId).toBe(tenantId);
            expect(result.createdBy).toBe(userId);
        });
    });

    describe('update', () => {
        it('should update tutor with matching id and tenant', async () => {
            const updateData = { firstName: 'Updated Name' };
            repo.findOne.mockResolvedValue(mockTutor);
            repo.save.mockResolvedValue({ ...mockTutor, ...updateData });

            const result = await service.update(tenantId, 'tutor-uuid-1', updateData);

            expect(repo.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'tutor-uuid-1', tenantId },
                }),
            );
            expect(result.firstName).toBe(updateData.firstName);
            expect(repo.save).toHaveBeenCalledWith(expect.objectContaining(updateData));
        });

        it('should throw NotFoundException for missing tutor', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(
                service.update(tenantId, 'nonexistent', { firstName: 'New Name' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should soft remove tutor', async () => {
            repo.findOne.mockResolvedValue(mockTutor);

            await service.remove(tenantId, 'tutor-uuid-1');

            expect(repo.findOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'tutor-uuid-1', tenantId },
                }),
            );
            expect(repo.softRemove).toHaveBeenCalledWith(mockTutor);
        });

        it('should throw NotFoundException for missing tutor', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(service.remove(tenantId, 'nonexistent')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
