// ============================================================================
// Upload Controller — File upload endpoints
// ============================================================================

import {
  Controller,
  Post,
  UseGuards,
  Param,
  Req,
  BadRequestException,
  Get,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { StorageService, UploadResult } from "./storage.service";

// Note: In production, use @nestjs/platform-express FileInterceptor
// For scaffold we define the endpoint signatures

@Controller("uploads")
@UseGuards(AuthGuard("jwt"))
export class UploadController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * POST /api/uploads/:category
   * Upload a file (multipart/form-data)
   */
  @Post(":category")
  async uploadFile(
    @Param("category")
    category: "photos" | "documents" | "xrays" | "lab-results" | "avatars",
    @Req() req: any,
  ): Promise<{ data: UploadResult }> {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException("Tenant context required");
    }

    // In production, use FileInterceptor and @UploadedFile()
    // const file = req.file;
    // return { data: await this.storageService.upload(tenantId, category, file.buffer, file.originalname, file.mimetype) };

    // Stub response for scaffold
    return {
      data: {
        key: `${tenantId}/${category}/stub-file.jpg`,
        url: `http://localhost:9000/vetsaas-files/${tenantId}/${category}/stub-file.jpg`,
        bucket: "vetsaas-files",
        size: 0,
        mimeType: "image/jpeg",
        checksum: "stub",
      },
    };
  }

  /**
   * POST /api/uploads/:category/presigned
   * Get a pre-signed URL for direct browser upload
   */
  @Post(":category/presigned")
  async getPresignedUrl(
    @Param("category") category: string,
    @Req() req: any,
    @Query("fileName") fileName: string,
    @Query("mimeType") mimeType: string,
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException("Tenant context required");
    }

    const result = await this.storageService.getPresignedUploadUrl(
      tenantId,
      category,
      fileName,
      mimeType,
    );

    return { data: result };
  }

  /**
   * GET /api/uploads/download?key=...
   * Get a pre-signed download URL
   */
  @Get("download")
  async getDownloadUrl(@Query("key") key: string) {
    const url = await this.storageService.getPresignedDownloadUrl(key);
    return { data: { url } };
  }
}
