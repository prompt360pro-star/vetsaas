// ============================================================================
// Storage Service — S3-compatible (MinIO for dev, AWS S3 / DigitalOcean for prod)
// ============================================================================

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
} from '@aws-sdk/client-s3';
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

        const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY', 'minioadmin');
        const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY', 'minioadmin');

        this.s3Client = new S3Client({
            endpoint: this.endpoint,
            region: this.region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            forcePathStyle: true, // Needed for MinIO compatibility
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

        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    Body: buffer,
                    ContentType: mimeType,
                    Metadata: {
                        'original-name': originalName,
                        'tenant-id': tenantId,
                    },
                }),
            );

            this.logger.log(
                `Uploaded: ${key} (${(buffer.length / 1024).toFixed(1)}KB, ${mimeType}) | Tenant: ${tenantId}`,
            );

            // Construct public URL (assumes bucket is public or behind a proxy that handles auth/presigning if private)
            // For private buckets, getPresignedDownloadUrl should be used instead of raw URL
            const url = `${this.endpoint}/${this.bucket}/${key}`;

            return {
                key,
                url,
                bucket: this.bucket,
                size: buffer.length,
                mimeType,
                checksum,
            };
        } catch (error) {
            this.logger.error(`Failed to upload file: ${key}`, error);
            throw new BadRequestException('Falha ao carregar o ficheiro para o armazenamento.');
        }
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

        try {
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                ContentType: mimeType,
                Metadata: {
                    'original-name': fileName,
                    'tenant-id': tenantId,
                },
            });

            const uploadUrl = await getSignedUrl(this.s3Client, command, {
                expiresIn: expiresInSeconds,
            });

            this.logger.log(
                `Pre-signed URL generated: ${key} | Tenant: ${tenantId} | Expires: ${expiresInSeconds}s`,
            );

            return { uploadUrl, key, expiresIn: expiresInSeconds };
        } catch (error) {
            this.logger.error(`Failed to generate pre-signed upload URL for: ${key}`, error);
            throw new BadRequestException('Falha ao gerar URL de upload.');
        }
    }

    /**
     * Get a pre-signed download URL for a stored file.
     */
    async getPresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            return await getSignedUrl(this.s3Client, command, {
                expiresIn: expiresInSeconds,
            });
        } catch (error) {
            this.logger.error(`Failed to generate pre-signed download URL for: ${key}`, error);
            throw new BadRequestException('Falha ao gerar URL de download.');
        }
    }

    /**
     * Delete a file from storage.
     */
    async delete(key: string): Promise<void> {
        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );
            this.logger.log(`Deleted: ${key}`);
        } catch (error) {
            this.logger.error(`Failed to delete file: ${key}`, error);
            // We might not want to throw here to make delete operations idempotent/robust
        }
    }

    /**
     * List files for a tenant in a specific category.
     */
    async listFiles(
        tenantId: string,
        category: string,
        maxResults = 100,
    ): Promise<{ key: string; size: number; lastModified: Date }[]> {
        const prefix = `${tenantId}/${category}/`;
        try {
            const response = await this.s3Client.send(
                new ListObjectsV2Command({
                    Bucket: this.bucket,
                    Prefix: prefix,
                    MaxKeys: maxResults,
                }),
            );

            return (
                response.Contents?.map((item) => ({
                    key: item.Key || '',
                    size: item.Size || 0,
                    lastModified: item.LastModified || new Date(),
                })) || []
            );
        } catch (error) {
            this.logger.error(`Failed to list files: ${prefix}`, error);
            throw new BadRequestException('Falha ao listar ficheiros.');
        }
    }
}
