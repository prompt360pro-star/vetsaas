import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('StorageService', () => {
    let service: StorageService;
    let configService: ConfigService;
    let s3ClientMock: any;

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();

        s3ClientMock = {
            send: jest.fn(),
        };
        (S3Client as jest.Mock).mockImplementation(() => s3ClientMock);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            const config = {
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
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('uploadFile', () => {
        it('should upload file successfully', async () => {
            s3ClientMock.send.mockResolvedValue({});

            const file = {
                buffer: Buffer.from('test'),
                originalname: 'test.png',
                mimetype: 'image/png',
            } as Express.Multer.File;

            const result = await service.uploadFile(file, 'tenant-1', 'avatars');

            expect(result).toEqual(expect.objectContaining({
                key: expect.stringContaining('tenant-1/avatars/'),
                url: expect.stringContaining('tenant-1/avatars/'),
            }));
            expect(PutObjectCommand).toHaveBeenCalled();
        });
    });

    describe('getPresignedDownloadUrl', () => {
        it('should generate presigned url', async () => {
            (getSignedUrl as jest.Mock).mockResolvedValue('http://signed-url');

            const url = await service.getPresignedDownloadUrl('tenant-1/file.pdf');

            expect(url).toBe('http://signed-url');
            expect(GetObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
                Bucket: 'vetsaas-test',
                Key: 'tenant-1/file.pdf',
                ResponseContentDisposition: 'attachment',
            }));
        });
    });
});
