// ============================================================================
// Storage Service — S3-compatible (MinIO for dev, AWS S3 / DigitalOcean for prod)
// ============================================================================

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadResult {
    key: string;
    url: string;
    bucket: string;
    size: number;
    mimeType: string;
    checksum: string;
}

export interface PresignedUrlResult {
    uploadUrl: string;
    key: string;
    expiresIn: number;
}

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'image/dicom',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly bucket: string;
    private readonly endpoint: string;
    private readonly region: string;
    private readonly s3Client: S3Client;

    constructor(private configService: ConfigService) {
        this.bucket = this.configService.get<string>('S3_BUCKET', 'vetsaas-files');
        this.endpoint = this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000');
        this.region = this.configService.get<string>('S3_REGION', 'us-east-1');

        this.s3Client = new S3Client({
            endpoint: this.endpoint,
            region: this.region,
            credentials: {
                accessKeyId: this.configService.get<string>('S3_ACCESS_KEY', 'minioadmin'),
                secretAccessKey: this.configService.get<string>('S3_SECRET_KEY', 'minioadmin'),
            },
            forcePathStyle: true, // Required for MinIO
        });
    }

    /**
     * Upload a file buffer to S3-compatible storage.
     * Organizes files by tenant for isolation: {tenantId}/{category}/{filename}
     */
    async upload(
        tenantId: string,
        category: 'photos' | 'documents' | 'xrays' | 'lab-results' | 'avatars',
        buffer: Buffer,
        originalName: string,
        mimeType: string,
    ): Promise<UploadResult> {
        // Validate
        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
            throw new BadRequestException(
                `Tipo de ficheiro não suportado: ${mimeType}. Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`,
            );
        }

        if (buffer.length > MAX_FILE_SIZE) {
            throw new BadRequestException(
                `Ficheiro demasiado grande (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            );
        }

        // Generate unique key with tenant isolation
        const ext = originalName.split('.').pop()?.toLowerCase() || 'bin';
        const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);
        const timestamp = Date.now();
        const key = `${tenantId}/${category}/${timestamp}-${hash}.${ext}`;

        const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

        // TODO: Replace with actual S3 SDK call
        // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
        // const s3 = new S3Client({ endpoint, region, credentials: {...} });
        // await s3.send(new PutObjectCommand({ Bucket, Key: key, Body: buffer, ContentType: mimeType }));

        this.logger.log(
            `[STORAGE STUB] Uploaded: ${key} (${(buffer.length / 1024).toFixed(1)}KB, ${mimeType}) | Tenant: ${tenantId}`,
        );

        return {
            key,
            url: `${this.endpoint}/${this.bucket}/${key}`,
            bucket: this.bucket,
            size: buffer.length,
            mimeType,
            checksum,
        };
    }

    /**
     * Generate a pre-signed upload URL (for direct browser upload).
     */
    async getPresignedUploadUrl(
        tenantId: string,
        category: string,
        fileName: string,
        mimeType: string,
        expiresInSeconds = 3600,
    ): Promise<PresignedUrlResult> {
        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
            throw new BadRequestException(`Tipo de ficheiro não suportado: ${mimeType}`);
        }

        const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
        const key = `${tenantId}/${category}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: mimeType,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });

        this.logger.log(
            `[STORAGE] Pre-signed URL generated: ${key} | Tenant: ${tenantId} | Expires: ${expiresInSeconds}s`,
        );

        return { uploadUrl, key, expiresIn: expiresInSeconds };
    }

    /**
     * Get a pre-signed download URL for a stored file.
     */
    async getPresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
        // TODO: Replace with actual S3 pre-signed GET URL
        return `${this.endpoint}/${this.bucket}/${key}?download=true&expires=${expiresInSeconds}`;
    }

    /**
     * Delete a file from storage.
     */
    async delete(key: string): Promise<void> {
        // TODO: Replace with actual S3 DeleteObjectCommand
        this.logger.log(`[STORAGE STUB] Deleted: ${key}`);
    }

    /**
     * List files for a tenant in a specific category.
     */
    async listFiles(
        tenantId: string,
        category: string,
        maxResults = 100,
    ): Promise<{ key: string; size: number; lastModified: Date }[]> {
        // TODO: Replace with actual S3 ListObjectsV2Command
        this.logger.log(`[STORAGE STUB] Listing: ${tenantId}/${category} (max: ${maxResults})`);
        return [];
    }
}
