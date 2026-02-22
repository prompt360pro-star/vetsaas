import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentEntity } from './appointment.entity';

describe('AppointmentsService', () => {
    let service: AppointmentsService;
    let repo: any;

    const mockAppointment = {
        id: 'appointment-uuid-1',
        tenantId: 'tenant-uuid-1',
        veterinarianId: 'vet-uuid-1',
        scheduledAt: new Date('2023-10-27T10:00:00Z'),
        status: 'SCHEDULED',
        checkedInAt: null,
        startedAt: null,
        completedAt: null,
        cancelledAt: null,
    };

    const mockRepo = {
        findAndCount: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        count: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppointmentsService,
                {
                    provide: getRepositoryToken(AppointmentEntity),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        service = module.get<AppointmentsService>(AppointmentsService);
        repo = module.get(getRepositoryToken(AppointmentEntity));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated results with defaults', async () => {
            const result = {
                data: [mockAppointment],
                total: 1,
            };
            mockRepo.findAndCount.mockResolvedValue([result.data, result.total]);

            const response = await service.findAll('tenant-uuid-1', {});

            expect(mockRepo.findAndCount).toHaveBeenCalledWith({
                where: { tenantId: 'tenant-uuid-1' },
                skip: 0,
                take: 50,
                order: { scheduledAt: 'ASC' },
            });
            expect(response).toEqual({
                data: result.data,
                total: result.total,
                page: 1,
                limit: 50,
                totalPages: 1,
            });
        });

        it('should filter by veterinarianId', async () => {
            mockRepo.findAndCount.mockResolvedValue([[mockAppointment], 1]);

            await service.findAll('tenant-uuid-1', { veterinarianId: 'vet-uuid-1' });

            expect(mockRepo.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        tenantId: 'tenant-uuid-1',
                        veterinarianId: 'vet-uuid-1',
                    }),
                }),
            );
        });

        it('should filter by date', async () => {
            mockRepo.findAndCount.mockResolvedValue([[mockAppointment], 1]);
            const dateStr = '2023-10-27';

            await service.findAll('tenant-uuid-1', { date: dateStr });

            expect(mockRepo.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        tenantId: 'tenant-uuid-1',
                        scheduledAt: expect.anything(),
                    }),
                }),
            );
        });

        it('should apply pagination', async () => {
            mockRepo.findAndCount.mockResolvedValue([[mockAppointment], 1]);

            await service.findAll('tenant-uuid-1', { page: 2, limit: 10 });

            expect(mockRepo.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 10,
                    take: 10,
                }),
            );
        });
    });

    describe('findById', () => {
        it('should return an appointment if found', async () => {
            mockRepo.findOne.mockResolvedValue(mockAppointment);

            const result = await service.findById('tenant-uuid-1', 'appointment-uuid-1');

            expect(mockRepo.findOne).toHaveBeenCalledWith({
                where: { id: 'appointment-uuid-1', tenantId: 'tenant-uuid-1' },
            });
            expect(result).toEqual(mockAppointment);
        });

        it('should throw NotFoundException if not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(
                service.findById('tenant-uuid-1', 'non-existent-id'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create and save a new appointment', async () => {
            const data = {
                veterinarianId: 'vet-uuid-1',
                scheduledAt: new Date(),
                status: 'SCHEDULED',
            };
            const createdAppointment = { ...data, tenantId: 'tenant-uuid-1', createdBy: 'user-uuid-1' };

            mockRepo.create.mockReturnValue(createdAppointment);
            mockRepo.save.mockResolvedValue(createdAppointment);

            const result = await service.create('tenant-uuid-1', 'user-uuid-1', data);

            expect(mockRepo.create).toHaveBeenCalledWith({
                ...data,
                tenantId: 'tenant-uuid-1',
                createdBy: 'user-uuid-1',
            });
            expect(mockRepo.save).toHaveBeenCalledWith(createdAppointment);
            expect(result).toEqual(createdAppointment);
        });
    });

    describe('updateStatus', () => {
        it('should update status to CHECKED_IN and set timestamp', async () => {
            const appointment = { ...mockAppointment };
            mockRepo.findOne.mockResolvedValue(appointment);
            mockRepo.save.mockImplementation((a: any) => Promise.resolve(a));

            const result = await service.updateStatus('tenant-uuid-1', 'appointment-uuid-1', 'CHECKED_IN');

            expect(result.status).toBe('CHECKED_IN');
            expect(result.checkedInAt).toBeInstanceOf(Date);
            expect(mockRepo.save).toHaveBeenCalled();
        });

        it('should update status to IN_PROGRESS and set timestamp', async () => {
            const appointment = { ...mockAppointment };
            mockRepo.findOne.mockResolvedValue(appointment);
            mockRepo.save.mockImplementation((a: any) => Promise.resolve(a));

            const result = await service.updateStatus('tenant-uuid-1', 'appointment-uuid-1', 'IN_PROGRESS');

            expect(result.status).toBe('IN_PROGRESS');
            expect(result.startedAt).toBeInstanceOf(Date);
        });

        it('should update status to COMPLETED and set timestamp', async () => {
            const appointment = { ...mockAppointment };
            mockRepo.findOne.mockResolvedValue(appointment);
            mockRepo.save.mockImplementation((a: any) => Promise.resolve(a));

            const result = await service.updateStatus('tenant-uuid-1', 'appointment-uuid-1', 'COMPLETED');

            expect(result.status).toBe('COMPLETED');
            expect(result.completedAt).toBeInstanceOf(Date);
        });

        it('should update status to CANCELLED and set timestamp', async () => {
            const appointment = { ...mockAppointment };
            mockRepo.findOne.mockResolvedValue(appointment);
            mockRepo.save.mockImplementation((a: any) => Promise.resolve(a));

            const result = await service.updateStatus('tenant-uuid-1', 'appointment-uuid-1', 'CANCELLED');

            expect(result.status).toBe('CANCELLED');
            expect(result.cancelledAt).toBeInstanceOf(Date);
        });

        it('should throw NotFoundException if appointment not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(
                service.updateStatus('tenant-uuid-1', 'non-existent-id', 'CHECKED_IN'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update appointment with partial data', async () => {
            const appointment = { ...mockAppointment };
            const updateData = { notes: 'New notes', isTeleconsult: true };
            mockRepo.findOne.mockResolvedValue(appointment);
            mockRepo.save.mockImplementation((a: any) => Promise.resolve(a));

            const result = await service.update('tenant-uuid-1', 'appointment-uuid-1', updateData);

            expect(mockRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...appointment,
                    ...updateData,
                }),
            );
            expect(result).toMatchObject(updateData);
        });

        it('should throw NotFoundException if appointment not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(
                service.update('tenant-uuid-1', 'non-existent-id', { notes: 'New notes' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('todayCount', () => {
        it('should return count of appointments for today', async () => {
            mockRepo.count.mockResolvedValue(5);

            const result = await service.todayCount('tenant-uuid-1');

            expect(mockRepo.count).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        tenantId: 'tenant-uuid-1',
                        scheduledAt: expect.anything(),
                    }),
                }),
            );
            expect(result).toBe(5);
        });
    });
});
