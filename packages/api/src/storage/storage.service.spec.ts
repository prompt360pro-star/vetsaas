import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { StorageService } from "./storage.service";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Mock AWS SDK
jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
  };
});

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));

describe("StorageService", () => {
  let service: StorageService;
  let s3ClientMock: any;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "S3_BUCKET") return "test-bucket";
      if (key === "S3_REGION") return "us-east-1";
      if (key === "S3_ENDPOINT") return "http://localhost:9000";
      if (key === "S3_ACCESS_KEY") return "minio";
      if (key === "S3_SECRET_KEY") return "minio123";
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    // Access private s3Client for mocking
    s3ClientMock = (service as any).s3Client;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("uploadFile", () => {
    it("should upload file to S3", async () => {
      const buffer = Buffer.from("test");
      const result = await service.uploadFile(
        "tenant-1",
        "test.txt",
        buffer,
        "text/plain",
      );

      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: expect.stringMatching(/^tenant-1\/.*\/test.txt$/),
        Body: buffer,
        ContentType: "text/plain",
      });
      expect(result).toEqual(expect.stringMatching(/^tenant-1\/.*\/test.txt$/));
    });
  });

  describe("getPresignedUrl", () => {
    it("should generate presigned URL", async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue("http://signed-url");

      const url = await service.getPresignedUrl("tenant-1/file.txt");

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "tenant-1/file.txt",
      });
      expect(url).toBe("http://signed-url");
    });
  });

  describe("getPresignedDownloadUrl", () => {
    it("should generate download URL with attachment disposition", async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue("http://download-url");

      const url = await service.getPresignedDownloadUrl(
        "tenant-1/file.txt",
        "mydoc.txt",
      );

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "tenant-1/file.txt",
        ResponseContentDisposition: 'attachment; filename="mydoc.txt"',
      });
      expect(url).toBe("http://download-url");
    });
  });
});
