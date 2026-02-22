import { Test, TestingModule } from '@nestjs/testing';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';
import { TutorEntity } from './tutor.entity';

describe('TutorsController', () => {
  let controller: TutorsController;
  let service: TutorsService;

  const mockTutorsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTutor: Partial<TutorEntity> = {
    id: 'tutor-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    tenantId: 'tenant-123',
  };

  const mockUser = {
    tenantId: 'tenant-123',
    sub: 'user-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TutorsController],
      providers: [
        {
          provide: TutorsService,
          useValue: mockTutorsService,
        },
      ],
    }).compile();

    controller = module.get<TutorsController>(TutorsController);
    service = module.get<TutorsService>(TutorsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated tutors', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        data: [mockTutor],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockTutorsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll({ user: mockUser }, query);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.tenantId, query);
      expect(result).toEqual({ success: true, data: expectedResult });
    });
  });

  describe('findById', () => {
    it('should return a tutor by id', async () => {
      mockTutorsService.findById.mockResolvedValue(mockTutor);

      const result = await controller.findById({ user: mockUser }, 'tutor-123');

      expect(service.findById).toHaveBeenCalledWith(mockUser.tenantId, 'tutor-123');
      expect(result).toEqual({ success: true, data: mockTutor });
    });

    it('should throw an error if tutor not found', async () => {
      mockTutorsService.findById.mockRejectedValue(new Error('Tutor not found'));

      await expect(controller.findById({ user: mockUser }, 'invalid-id')).rejects.toThrow(
        'Tutor not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new tutor', async () => {
      const createDto = { firstName: 'Jane', lastName: 'Doe' };
      const createdTutor = { ...mockTutor, ...createDto };

      mockTutorsService.create.mockResolvedValue(createdTutor);

      const result = await controller.create({ user: mockUser }, createDto);

      expect(service.create).toHaveBeenCalledWith(mockUser.tenantId, mockUser.sub, createDto);
      expect(result).toEqual({ success: true, data: createdTutor });
    });
  });

  describe('update', () => {
    it('should update a tutor', async () => {
      const updateDto = { firstName: 'Johnny' };
      const updatedTutor = { ...mockTutor, ...updateDto };

      mockTutorsService.update.mockResolvedValue(updatedTutor);

      const result = await controller.update({ user: mockUser }, 'tutor-123', updateDto);

      expect(service.update).toHaveBeenCalledWith(mockUser.tenantId, 'tutor-123', updateDto);
      expect(result).toEqual({ success: true, data: updatedTutor });
    });
  });

  describe('remove', () => {
    it('should remove a tutor', async () => {
      mockTutorsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove({ user: mockUser }, 'tutor-123');

      expect(service.remove).toHaveBeenCalledWith(mockUser.tenantId, 'tutor-123');
      expect(result).toEqual({ success: true, message: 'Tutor removed' });
    });
  });
});
