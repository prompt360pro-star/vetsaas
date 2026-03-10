// ============================================================================
// Storage Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";
import { StorageService } from "./storage.service";

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("upload", () => {
    it("should upload file with tenant-isolated path", async () => {
      const buffer = Buffer.from("test image data");
      const result = await service.upload(
        "tenant-1",
        "photos",
        buffer,
        "pet-photo.jpg",
        "image/jpeg",
      );

      expect(result.key).toContain("tenant-1/photos/");
      expect(result.key).toEndWith(".jpg");
      expect(result.size).toBe(buffer.length);
      expect(result.mimeType).toBe("image/jpeg");
      expect(result.checksum).toBeDefined();
      expect(result.checksum.length).toBe(64); // SHA-256 hex
    });

    it("should reject unsupported MIME types", async () => {
      const buffer = Buffer.from("fake executable");

      await expect(
        service.upload(
          "tenant-1",
          "photos",
          buffer,
          "malware.exe",
          "application/x-msdownload",
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should reject files exceeding max size", async () => {
      // Create a buffer larger than 20MB
      const hugeBuffer = Buffer.alloc(21 * 1024 * 1024);

      await expect(
        service.upload(
          "tenant-1",
          "photos",
          hugeBuffer,
          "huge.jpg",
          "image/jpeg",
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should accept DICOM files for xrays", async () => {
      const buffer = Buffer.from("dicom data");
      const result = await service.upload(
        "tenant-1",
        "xrays",
        buffer,
        "scan.dcm",
        "image/dicom",
      );

      expect(result.key).toContain("tenant-1/xrays/");
      expect(result.mimeType).toBe("image/dicom");
    });

    it("should accept PDF documents", async () => {
      const buffer = Buffer.from("pdf data");
      const result = await service.upload(
        "tenant-1",
        "documents",
        buffer,
        "report.pdf",
        "application/pdf",
      );

      expect(result.key).toContain("tenant-1/documents/");
    });

    it("should generate keys with correct structure", async () => {
      const buffer = Buffer.from("data");

      const result1 = await service.upload(
        "tenant-1",
        "photos",
        buffer,
        "a.jpg",
        "image/jpeg",
      );

      // Key should have tenant/category prefix and correct extension
      expect(result1.key).toContain("tenant-1/photos/");
      expect(result1.key).toMatch(/\.jpg$/);
    });
  });

  describe("getPresignedUploadUrl", () => {
    it("should generate pre-signed URL with tenant prefix", async () => {
      const result = await service.getPresignedUploadUrl(
        "tenant-1",
        "photos",
        "photo.jpg",
        "image/jpeg",
      );

      expect(result.uploadUrl).toContain("tenant-1/photos/");
      expect(result.key).toContain("tenant-1/photos/");
      expect(result.expiresIn).toBe(3600);
    });

    it("should reject unsupported MIME type in pre-signed URL", async () => {
      await expect(
        service.getPresignedUploadUrl(
          "tenant-1",
          "photos",
          "file.exe",
          "application/x-msdownload",
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getPresignedDownloadUrl", () => {
    it("should return download URL", async () => {
      const url = await service.getPresignedDownloadUrl(
        "tenant-1/photos/test.jpg",
      );

      expect(url).toContain("tenant-1/photos/test.jpg");
      expect(url).toContain("download=true");
    });
  });

  describe("delete", () => {
    it("should not throw on delete", async () => {
      await expect(
        service.delete("tenant-1/photos/test.jpg"),
      ).resolves.not.toThrow();
    });
  });

  describe("listFiles", () => {
    it("should return empty array (stub)", async () => {
      const result = await service.listFiles("tenant-1", "photos");
      expect(result).toEqual([]);
    });
  });
});

// Custom matcher
expect.extend({
  toEndWith(received: string, suffix: string) {
    const pass = received.endsWith(suffix);
    return {
      pass,
      message: () => `expected "${received}" to end with "${suffix}"`,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toEndWith(suffix: string): R;
    }
  }
}
