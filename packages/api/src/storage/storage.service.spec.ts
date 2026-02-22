import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('StorageService', () => {
    let service: StorageService;

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            const config: Record<string, string> = {
                                S3_ENDPOINT: 'http://localhost:9000',
                                S3_REGION: 'us-east-1',
                                S3_ACCESS_KEY: 'minioadmin',
                                S3_SECRET_KEY: 'minioadmin',
                                S3_BUCKET: 'vetsaas-test',
                            };
                            return config[key];
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<StorageService>(StorageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('upload', () => {
        it('should upload file successfully', async () => {
            const buffer = Buffer.from('test');
            const result = await service.upload('tenant-1', 'avatars', buffer, 'test.png', 'image/png');

            expect(result).toEqual(expect.objectContaining({
                key: expect.stringContaining('tenant-1/avatars/'),
                url: expect.stringContaining('tenant-1/avatars/'),
            }));
        });
    });

    describe('getPresignedDownloadUrl', () => {
        it('should generate presigned url', async () => {
            const url = await service.getPresignedDownloadUrl('tenant-1/file.pdf');
            expect(url).toContain('tenant-1/file.pdf');
        });
    });
});
