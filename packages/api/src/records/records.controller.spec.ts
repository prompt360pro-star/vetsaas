import { Test, TestingModule } from '@nestjs/testing';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

describe('RecordsController', () => {
  let controller: RecordsController;
  let service: RecordsService;

  const mockRecordsService = {
    findByAnimal: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    sign: jest.fn(),
  };

  const mockRequest = {
    user: {
      tenantId: 'tenant-1',
      sub: 'user-1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordsController],
      providers: [
        {
          provide: RecordsService,
          useValue: mockRecordsService,
        },
      ],
    }).compile();

    controller = module.get<RecordsController>(RecordsController);
    service = module.get<RecordsService>(RecordsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByAnimal', () => {
    it('should return records for an animal', async () => {
      const result = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
      mockRecordsService.findByAnimal.mockResolvedValue(result);

      const query = { page: 1, limit: 10 };
      const response = await controller.findByAnimal(mockRequest, 'animal-1', query);

      expect(response).toEqual({ success: true, data: result });
      expect(mockRecordsService.findByAnimal).toHaveBeenCalledWith(
        'tenant-1',
        'animal-1',
        query,
      );
    });
  });

  describe('findById', () => {
    it('should return a record by id', async () => {
      const result = { id: 'record-1' };
      mockRecordsService.findById.mockResolvedValue(result);

      const response = await controller.findById(mockRequest, 'record-1');

      expect(response).toEqual({ success: true, data: result });
      expect(mockRecordsService.findById).toHaveBeenCalledWith('tenant-1', 'record-1');
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const body = { note: 'test' };
      const result = { id: 'record-1', ...body };
      mockRecordsService.create.mockResolvedValue(result);

      const response = await controller.create(mockRequest, body);

      expect(response).toEqual({ success: true, data: result });
      expect(mockRecordsService.create).toHaveBeenCalledWith(
        'tenant-1',
        'user-1',
        body,
      );
    });
  });

  describe('update', () => {
    it('should update a record', async () => {
      const body = { note: 'updated' };
      const result = { id: 'record-1', ...body };
      mockRecordsService.update.mockResolvedValue(result);

      const response = await controller.update(mockRequest, 'record-1', body);

      expect(response).toEqual({ success: true, data: result });
      expect(mockRecordsService.update).toHaveBeenCalledWith(
        'tenant-1',
        'record-1',
        body,
      );
    });
  });

  describe('sign', () => {
    it('should sign a record', async () => {
      const result = { id: 'record-1', signedBy: 'user-1' };
      mockRecordsService.sign.mockResolvedValue(result);

      const response = await controller.sign(mockRequest, 'record-1');

      expect(response).toEqual({ success: true, data: result });
      expect(mockRecordsService.sign).toHaveBeenCalledWith(
        'tenant-1',
        'record-1',
        'user-1',
      );
    });
  });
});
