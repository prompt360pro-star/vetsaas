import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { StorageService } from "./storage.service";
import { BadRequestException } from "@nestjs/common";

describe("StorageService", () => {
  let service: StorageService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === "S3_BUCKET") return "test-bucket";
      if (key === "S3_REGION") return "us-east-1";
      if (key === "S3_ENDPOINT") return "http://localhost:9000";
      return defaultValue || null;
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
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("upload", () => {
    it("should upload valid file (stub)", async () => {
      const buffer = Buffer.from("test pdf content");
      const result = await service.upload(
        "tenant-1",
        "documents",
        buffer,
        "test.pdf",
        "application/pdf",
      );

      expect(result.key).toContain("tenant-1/documents/");
      expect(result.key).toContain(".pdf");
      expect(result.url).toContain("http://localhost:9000/test-bucket/");
      expect(result.bucket).toBe("test-bucket");
      expect(result.mimeType).toBe("application/pdf");
    });

    it("should throw error for invalid mime type", async () => {
      const buffer = Buffer.from("test");
      await expect(
        service.upload(
          "tenant-1",
          "documents",
          buffer,
          "test.txt",
          "text/plain",
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getPresignedUploadUrl", () => {
    it("should generate presigned upload URL (stub)", async () => {
      const result = await service.getPresignedUploadUrl(
        "tenant-1",
        "photos",
        "image.jpg",
        "image/jpeg",
      );

      expect(result.uploadUrl).toContain(
        "http://localhost:9000/test-bucket/tenant-1/photos/",
      );
      expect(result.key).toContain("tenant-1/photos/");
      expect(result.expiresIn).toBe(3600);
    });
  });

  describe("getPresignedDownloadUrl", () => {
    it("should generate download URL (stub)", async () => {
      const url = await service.getPresignedDownloadUrl("tenant-1/file.pdf");

      expect(url).toContain(
        "http://localhost:9000/test-bucket/tenant-1/file.pdf",
      );
      expect(url).toContain("download=true");
    });
  });
});
