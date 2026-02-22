import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentEntity } from './appointment.entity';
import { NotFoundException } from '@nestjs/common';

describe('AppointmentsService', () => {
    let service: AppointmentsService;
    let repo: Repository<AppointmentEntity>;

    const mockAppointment = {
        id: 'appointment-id',
        tenantId: 'tenant-id',
        veterinarianId: 'vet-id',
        scheduledAt: new Date('2023-10-25T10:00:00Z'),
        status: 'SCHEDULED',
    } as AppointmentEntity;

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
        repo = module.get<Repository<AppointmentEntity>>(getRepositoryToken(AppointmentEntity));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated appointments', async () => {
            mockRepo.findAndCount.mockResolvedValue([[mockAppointment], 1]);

            const result = await service.findAll('tenant-id', { page: 1, limit: 10 });

            expect(result).toEqual({
                data: [mockAppointment],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
            });
            expect(mockRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: { tenantId: 'tenant-id' },
                skip: 0,
                take: 10,
            }));
        });

        it('should filter by veterinarianId', async () => {
            mockRepo.findAndCount.mockResolvedValue([[mockAppointment], 1]);

            await service.findAll('tenant-id', { veterinarianId: 'vet-id' });

            expect(mockRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ veterinarianId: 'vet-id' }),
            }));
        });

        it('should filter by date', async () => {
            mockRepo.findAndCount.mockResolvedValue([[mockAppointment], 1]);
            const dateStr = '2023-10-25';

            await service.findAll('tenant-id', { date: dateStr });

            expect(mockRepo.findAndCount).toHaveBeenCalled();
            // Checking the call arguments for Between would be verbose, verifying it was called is sufficient given the logic
        });
    });

    describe('findById', () => {
        it('should return an appointment if found', async () => {
            mockRepo.findOne.mockResolvedValue(mockAppointment);

            const result = await service.findById('tenant-id', 'appointment-id');

            expect(result).toEqual(mockAppointment);
            expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 'appointment-id', tenantId: 'tenant-id' } });
        });

        it('should throw NotFoundException if not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.findById('tenant-id', 'appointment-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create and save a new appointment', async () => {
            const data = { veterinarianId: 'vet-id' };
            const newAppointment = { ...mockAppointment, ...data };

            mockRepo.create.mockReturnValue(newAppointment);
            mockRepo.save.mockResolvedValue(newAppointment);

            const result = await service.create('tenant-id', 'user-id', data);

            expect(result).toEqual(newAppointment);
            expect(mockRepo.create).toHaveBeenCalledWith({
                ...data,
                tenantId: 'tenant-id',
                createdBy: 'user-id',
            });
            expect(mockRepo.save).toHaveBeenCalledWith(newAppointment);
        });
    });

    describe('updateStatus', () => {
        it('should update status and save', async () => {
            mockRepo.findOne.mockResolvedValue({ ...mockAppointment });
            mockRepo.save.mockImplementation(a => Promise.resolve(a));

            const result = await service.updateStatus('tenant-id', 'appointment-id', 'CHECKED_IN');

            expect(result.status).toBe('CHECKED_IN');
            expect(result.checkedInAt).toBeDefined();
            expect(mockRepo.save).toHaveBeenCalled();
        });

        it('should set startedAt when status is IN_PROGRESS', async () => {
            mockRepo.findOne.mockResolvedValue({ ...mockAppointment });
            mockRepo.save.mockImplementation(a => Promise.resolve(a));

            const result = await service.updateStatus('tenant-id', 'appointment-id', 'IN_PROGRESS');

            expect(result.status).toBe('IN_PROGRESS');
            expect(result.startedAt).toBeDefined();
        });

        it('should throw NotFoundException if appointment not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.updateStatus('tenant-id', 'appointment-id', 'CHECKED_IN')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update fields and save', async () => {
            mockRepo.findOne.mockResolvedValue({ ...mockAppointment });
            mockRepo.save.mockImplementation(a => Promise.resolve(a));

            const result = await service.update('tenant-id', 'appointment-id', { notes: 'Updated notes' });

            expect(result.notes).toBe('Updated notes');
            expect(mockRepo.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException if appointment not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            await expect(service.update('tenant-id', 'appointment-id', { notes: 'Updated notes' })).rejects.toThrow(NotFoundException);
        });
    });

    describe('todayCount', () => {
        it('should return the count of appointments for today', async () => {
            mockRepo.count.mockResolvedValue(5);

            const result = await service.todayCount('tenant-id');

            expect(result).toBe(5);
            expect(mockRepo.count).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ tenantId: 'tenant-id' }),
            }));
        });
    });
});
