import {
    Controller,
    Post,
    UseGuards,
    Param,
    Req,
    BadRequestException,
    Get,
    Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StorageService, UploadResult } from './storage.service';

@Controller('uploads')
@UseGuards(AuthGuard('jwt'))
export class UploadController {
    constructor(private readonly storageService: StorageService) { }

    @Post(':category')
    async uploadFile(
        @Param('category') category: 'photos' | 'documents' | 'xrays' | 'lab-results' | 'avatars',
        @Req() req: any,
    ): Promise<{ data: UploadResult }> {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            throw new BadRequestException('Tenant context required');
        }

        return {
            data: {
                key: `${tenantId}/${category}/stub-file.jpg`,
                url: `http://localhost:9000/vetsaas-files/${tenantId}/${category}/stub-file.jpg`,
                bucket: 'vetsaas-files',
                size: 0,
                mimeType: 'image/jpeg',
                checksum: 'stub',
            },
        };
    }

    @Post(':category/presigned')
    async getPresignedUrl(
        @Param('category') category: string,
        @Req() req: any,
        @Query('fileName') fileName: string,
        @Query('mimeType') mimeType: string,
    ) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            throw new BadRequestException('Tenant context required');
        }

        const result = await this.storageService.getPresignedUploadUrl(
            tenantId,
            category,
            fileName,
            mimeType,
        );

        return { data: result };
    }

    @Get('download')
    async getDownloadUrl(@Query('key') key: string) {
        const url = await this.storageService.getPresignedDownloadUrl(key);
        return { data: { url } };
    }
}
