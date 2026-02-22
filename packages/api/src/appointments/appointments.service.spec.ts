import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentEntity } from './appointment.entity';

describe('AppointmentsService', () => {
    let service: AppointmentsService;
    let repo: Repository<AppointmentEntity>;

    const mockAppointment: AppointmentEntity = {
        id: 'appointment-uuid-1',
        tenantId: 'tenant-uuid-1',
        animalId: 'animal-uuid-1',
        tutorId: 'tutor-uuid-1',
        veterinarianId: 'vet-uuid-1',
        scheduledAt: new Date('2023-10-25T10:00:00Z'),
        duration: 30,
        appointmentType: 'CONSULTATION',
        status: 'SCHEDULED',
        reason: 'Regular Checkup',
        notes: '',
        isTeleconsult: false,
        teleconsultUrl: null,
        checkedInAt: null,
        startedAt: null,
        completedAt: null,
        cancelledAt: null,
        cancellationReason: null,
        createdBy: 'user-uuid-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppointmentsService,
                {
                    provide: getRepositoryToken(AppointmentEntity),
                    useValue: {
                        findAndCount: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        count: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AppointmentsService>(AppointmentsService);
        repo = module.get<Repository<AppointmentEntity>>(getRepositoryToken(AppointmentEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated appointments', async () => {
            const result = [mockAppointment];
            const total = 1;
            jest.spyOn(repo, 'findAndCount').mockResolvedValue([result, total]);

            const response = await service.findAll('tenant-uuid-1', { page: 1, limit: 10 });

            expect(repo.findAndCount).toHaveBeenCalledWith({
                where: { tenantId: 'tenant-uuid-1' },
                skip: 0,
                take: 10,
                order: { scheduledAt: 'ASC' },
            });
            expect(response).toEqual({
                data: result,
                total,
                page: 1,
                limit: 10,
                totalPages: 1,
            });
        });

        it('should filter by veterinarianId', async () => {
            jest.spyOn(repo, 'findAndCount').mockResolvedValue([[], 0]);

            await service.findAll('tenant-uuid-1', { veterinarianId: 'vet-uuid-1' });

            expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    veterinarianId: 'vet-uuid-1',
                }),
            }));
        });

        it('should filter by date', async () => {
            jest.spyOn(repo, 'findAndCount').mockResolvedValue([[], 0]);
            const date = '2023-10-25';

            await service.findAll('tenant-uuid-1', { date });

            expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    scheduledAt: expect.anything(),
                }),
            }));
        });
    });

    describe('findById', () => {
        it('should return an appointment if found', async () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue(mockAppointment);

            const result = await service.findById('tenant-uuid-1', 'appointment-uuid-1');

            expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'appointment-uuid-1', tenantId: 'tenant-uuid-1' } });
            expect(result).toEqual(mockAppointment);
        });

        it('should throw NotFoundException if not found', async () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue(null);

            await expect(service.findById('tenant-uuid-1', 'invalid-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create and save a new appointment', async () => {
            const input = {
                animalId: 'animal-uuid-1',
                tutorId: 'tutor-uuid-1',
                veterinarianId: 'vet-uuid-1',
                scheduledAt: new Date(),
            };
            const createdAppointment = { ...mockAppointment, ...input };

            jest.spyOn(repo, 'create').mockReturnValue(createdAppointment);
            jest.spyOn(repo, 'save').mockResolvedValue(createdAppointment);

            const result = await service.create('tenant-uuid-1', 'user-uuid-1', input);

            expect(repo.create).toHaveBeenCalledWith({
                ...input,
                tenantId: 'tenant-uuid-1',
                createdBy: 'user-uuid-1',
            });
            expect(repo.save).toHaveBeenCalledWith(createdAppointment);
            expect(result).toEqual(createdAppointment);
        });
    });

    describe('updateStatus', () => {
        it('should update status to CHECKED_IN', async () => {
            const appt = { ...mockAppointment };
            jest.spyOn(repo, 'findOne').mockResolvedValue(appt);
            jest.spyOn(repo, 'save').mockImplementation(async (entity) => entity as AppointmentEntity);

            const result = await service.updateStatus('tenant-uuid-1', 'appointment-uuid-1', 'CHECKED_IN');

            expect(repo.findOne).toHaveBeenCalled();
            expect(result.status).toBe('CHECKED_IN');
            expect(result.checkedInAt).toBeInstanceOf(Date);
            expect(repo.save).toHaveBeenCalledWith(appt);
        });

        it('should update status to IN_PROGRESS', async () => {
            const appt = { ...mockAppointment };
            jest.spyOn(repo, 'findOne').mockResolvedValue(appt);
            jest.spyOn(repo, 'save').mockImplementation(async (entity) => entity as AppointmentEntity);

            const result = await service.updateStatus('tenant-uuid-1', 'appointment-uuid-1', 'IN_PROGRESS');

            expect(result.status).toBe('IN_PROGRESS');
            expect(result.startedAt).toBeInstanceOf(Date);
            expect(repo.save).toHaveBeenCalledWith(appt);
        });

        it('should update status to COMPLETED', async () => {
            const appt = { ...mockAppointment };
            jest.spyOn(repo, 'findOne').mockResolvedValue(appt);
            jest.spyOn(repo, 'save').mockImplementation(async (entity) => entity as AppointmentEntity);

            const result = await service.updateStatus('tenant-uuid-1', 'appointment-uuid-1', 'COMPLETED');

            expect(result.status).toBe('COMPLETED');
            expect(result.completedAt).toBeInstanceOf(Date);
            expect(repo.save).toHaveBeenCalledWith(appt);
        });

        it('should update status to CANCELLED', async () => {
            const appt = { ...mockAppointment };
            jest.spyOn(repo, 'findOne').mockResolvedValue(appt);
            jest.spyOn(repo, 'save').mockImplementation(async (entity) => entity as AppointmentEntity);

            const result = await service.updateStatus('tenant-uuid-1', 'appointment-uuid-1', 'CANCELLED');

            expect(result.status).toBe('CANCELLED');
            expect(result.cancelledAt).toBeInstanceOf(Date);
            expect(repo.save).toHaveBeenCalledWith(appt);
        });

        it('should throw NotFoundException if appointment to update status is not found', async () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue(null);

            await expect(service.updateStatus('tenant-uuid-1', 'invalid-id', 'CHECKED_IN')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update an appointment with partial data', async () => {
            const appt = { ...mockAppointment };
            const updateData = { notes: 'Updated notes' };
            jest.spyOn(repo, 'findOne').mockResolvedValue(appt);
            jest.spyOn(repo, 'save').mockImplementation(async (entity) => entity as AppointmentEntity);

            const result = await service.update('tenant-uuid-1', 'appointment-uuid-1', updateData);

            expect(result.notes).toBe('Updated notes');
            expect(repo.save).toHaveBeenCalledWith(expect.objectContaining(updateData));
        });

        it('should throw NotFoundException if appointment to update is not found', async () => {
            jest.spyOn(repo, 'findOne').mockResolvedValue(null);

            await expect(service.update('tenant-uuid-1', 'invalid-id', { notes: 'test' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('todayCount', () => {
        it('should count appointments for today', async () => {
            jest.spyOn(repo, 'count').mockResolvedValue(5);

            const result = await service.todayCount('tenant-uuid-1');

            expect(repo.count).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    tenantId: 'tenant-uuid-1',
                    scheduledAt: expect.anything(),
                }),
            }));
            expect(result).toBe(5);
        });
    });
});
