// ============================================================================
// Storage Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { mockClient } from "aws-sdk-client-mock";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Mock getSignedUrl
jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn().mockResolvedValue("http://mock-signed-url"),
}));

describe("StorageService", () => {
  let service: StorageService;
  const s3Mock = mockClient(S3Client);

  beforeEach(async () => {
    s3Mock.reset();

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
      s3Mock.on(PutObjectCommand).resolves({});

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

      // Verify S3 call
      const calls = s3Mock.commandCalls(PutObjectCommand);
      expect(calls.length).toBe(1);
      const input = calls[0].args[0].input;
      expect(input.Bucket).toBe("vetsaas-files");
      expect(input.Key).toBe(result.key);
      expect(input.Body).toEqual(buffer);
      expect(input.ContentType).toBe("image/jpeg");
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
      s3Mock.on(PutObjectCommand).resolves({});
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
      s3Mock.on(PutObjectCommand).resolves({});
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
      s3Mock.on(PutObjectCommand).resolves({});
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

      expect(result.uploadUrl).toBe("http://mock-signed-url");
      expect(result.key).toContain("tenant-1/photos/");
      expect(result.expiresIn).toBe(3600);

      expect(getSignedUrl).toHaveBeenCalled();
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

      expect(url).toBe("http://mock-signed-url");
      expect(getSignedUrl).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should not throw on delete", async () => {
      s3Mock.on(DeleteObjectCommand).resolves({});
      await expect(
        service.delete("tenant-1/photos/test.jpg"),
      ).resolves.not.toThrow();
      expect(s3Mock.commandCalls(DeleteObjectCommand).length).toBe(1);
    });
  });

  describe("listFiles", () => {
    it("should return file list", async () => {
      s3Mock.on(ListObjectsV2Command).resolves({
        Contents: [
          { Key: "key1", Size: 123, LastModified: new Date() },
          { Key: "key2", Size: 456, LastModified: new Date() },
        ],
      });

      const result = await service.listFiles("tenant-1", "photos");
      expect(result.length).toBe(2);
      expect(result[0].key).toBe("key1");
      expect(result[1].key).toBe("key2");
    });

    it("should return empty list if no contents", async () => {
      s3Mock.on(ListObjectsV2Command).resolves({});

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
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toEndWith(suffix: string): R;
    }
  }
}
