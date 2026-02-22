
import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { StorageService } from './storage.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('UploadController', () => {
  let controller: UploadController;
  let storageService: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: StorageService,
          useValue: {
            getPresignedDownloadUrl: jest.fn().mockResolvedValue('http://example.com/download'),
            upload: jest.fn(),
            getPresignedUploadUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDownloadUrl', () => {
    it('should return download URL if key belongs to tenant', async () => {
      const req = { user: { tenantId: 'tenant-1' } };
      const key = 'tenant-1/photos/test.jpg';
      const result = await controller.getDownloadUrl(key, req);
      expect(result).toEqual({ data: { url: 'http://example.com/download' } });
      expect(storageService.getPresignedDownloadUrl).toHaveBeenCalledWith(key);
    });

    it('should throw ForbiddenException if key does not belong to tenant', async () => {
      const req = { user: { tenantId: 'tenant-1' } };
      const key = 'tenant-2/photos/secret.jpg';
      await expect(controller.getDownloadUrl(key, req)).rejects.toThrow(ForbiddenException);
    });
  });
});
