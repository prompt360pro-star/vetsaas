import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISmsProvider, NotificationResult } from './sms-provider.interface';

@Injectable()
export class GenericSmsProvider implements ISmsProvider {
    private readonly logger = new Logger(GenericSmsProvider.name);
    private readonly apiUrl: string;
    private readonly method: string;
    private readonly headers: Record<string, string>;
    private readonly bodyTemplate: string;

    constructor(private readonly configService: ConfigService) {
        this.apiUrl = this.configService.get<string>('SMS_GENERIC_URL', '');
        this.method = this.configService.get<string>('SMS_GENERIC_METHOD', 'POST');
        this.bodyTemplate = this.configService.get<string>('SMS_GENERIC_BODY_TEMPLATE', '');

        const headersJson = this.configService.get<string>('SMS_GENERIC_HEADERS', '{}');
        try {
            this.headers = JSON.parse(headersJson);
        } catch (e) {
            this.logger.error('Invalid JSON for SMS_GENERIC_HEADERS', e);
            this.headers = {};
        }

        if (!this.apiUrl) {
            this.logger.warn('Generic SMS configuration is missing (URL). SMS sending will fail if Generic provider is selected.');
        }
    }

    async send(phone: string, body: string, tenantId: string): Promise<NotificationResult> {
        if (!this.apiUrl) {
            return {
                success: false,
                error: 'Generic SMS provider URL is not configured',
                provider: 'generic',
            };
        }

        try {
            // Replace placeholders in body template or create a default JSON body if no template
            let requestBody: string;
            if (this.bodyTemplate) {
                requestBody = this.bodyTemplate
                    .replace(/\{\{phone\}\}/g, phone)
                    .replace(/\{\{body\}\}/g, body) // Note: This simple replacement might break JSON if body contains quotes
                    .replace(/\{\{tenantId\}\}/g, tenantId);
            } else {
                // Default fallback JSON
                requestBody = JSON.stringify({ to: phone, message: body, tenantId });
            }

            // If the body template is meant to be JSON, we should probably be careful about escaping.
            // But for now, we assume the user provides a correct template or handles escaping if they inject raw strings.
            // A safer approach for JSON templates would be to parse the template and inject values.
            // But let's stick to string replacement for flexibility (e.g. XML payloads, query params).

            const response = await fetch(this.apiUrl, {
                method: this.method,
                headers: {
                    'Content-Type': 'application/json',
                    ...this.headers,
                },
                body: this.method !== 'GET' ? requestBody : undefined,
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Failed to send SMS via Generic provider: ${response.status} ${response.statusText} - ${errorText}`);
                return {
                    success: false,
                    error: `Generic API error: ${response.statusText}`,
                    provider: 'generic',
                };
            }

            const responseData = await response.text();
            this.logger.log(`SMS sent via Generic provider to ${phone}`);

            return {
                success: true,
                messageId: `generic-${Date.now()}`, // We don't know how to extract ID from generic response
                provider: 'generic',
            };
        } catch (error: any) {
            this.logger.error(`Error sending SMS via Generic provider: ${error.message}`, error.stack);
            return {
                success: false,
                error: error.message,
                provider: 'generic',
            };
        }
    }
}
