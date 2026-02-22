// ============================================================================
// Notification Service — SMS / Email / Push stub for Angola
// ============================================================================

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as admin from 'firebase-admin';
import { DeviceTokenEntity, DevicePlatform } from './device-token.entity';

export enum NotificationChannel {
    SMS = 'SMS',
    EMAIL = 'EMAIL',
    PUSH = 'PUSH',
    WHATSAPP = 'WHATSAPP',
}

export enum NotificationTemplate {
    APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
    APPOINTMENT_CONFIRMATION = 'APPOINTMENT_CONFIRMATION',
    APPOINTMENT_CANCELLATION = 'APPOINTMENT_CANCELLATION',
    VACCINE_DUE = 'VACCINE_DUE',
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
    PAYMENT_OVERDUE = 'PAYMENT_OVERDUE',
    WELCOME = 'WELCOME',
    PASSWORD_RESET = 'PASSWORD_RESET',
}

export interface NotificationPayload {
    channel: NotificationChannel;
    template: NotificationTemplate;
    recipientPhone?: string;
    recipientEmail?: string;
    recipientName: string;
    userId?: string;
    locale: string;
    data: Record<string, string>;
    tenantId: string;
    scheduledFor?: Date;
}

interface NotificationResult {
    success: boolean;
    messageId?: string;
    provider?: string;
    error?: string;
}

// Portuguese notification templates for Angola
const TEMPLATES: Record<NotificationTemplate, { subject: string; body: string }> = {
    [NotificationTemplate.APPOINTMENT_REMINDER]: {
        subject: 'Lembrete de Consulta — {{clinicName}}',
        body: 'Olá {{recipientName}}, relembramos que {{animalName}} tem consulta agendada para {{date}} às {{time}}. {{clinicName}}',
    },
    [NotificationTemplate.APPOINTMENT_CONFIRMATION]: {
        subject: 'Consulta Confirmada — {{clinicName}}',
        body: 'Olá {{recipientName}}, a consulta de {{animalName}} foi confirmada para {{date}} às {{time}}. {{clinicName}}',
    },
    [NotificationTemplate.APPOINTMENT_CANCELLATION]: {
        subject: 'Consulta Cancelada — {{clinicName}}',
        body: 'Olá {{recipientName}}, a consulta de {{animalName}} marcada para {{date}} foi cancelada. Para reagendar, contacte-nos. {{clinicName}}',
    },
    [NotificationTemplate.VACCINE_DUE]: {
        subject: 'Vacina Pendente — {{clinicName}}',
        body: 'Olá {{recipientName}}, {{animalName}} tem a vacina {{vaccineName}} pendente (vencida em {{dueDate}}). Agende já! {{clinicName}}',
    },
    [NotificationTemplate.PAYMENT_RECEIVED]: {
        subject: 'Pagamento Confirmado — {{clinicName}}',
        body: 'Olá {{recipientName}}, confirmamos o recebimento de {{amount}} referente a {{description}}. Obrigado! {{clinicName}}',
    },
    [NotificationTemplate.PAYMENT_OVERDUE]: {
        subject: 'Pagamento Pendente — {{clinicName}}',
        body: 'Olá {{recipientName}}, a fatura {{invoiceRef}} no valor de {{amount}} encontra-se pendente. {{clinicName}}',
    },
    [NotificationTemplate.WELCOME]: {
        subject: 'Bem-vindo ao {{clinicName}}!',
        body: 'Olá {{recipientName}}, a sua conta na {{clinicName}} foi criada com sucesso. Pode aceder em {{loginUrl}}.',
    },
    [NotificationTemplate.PASSWORD_RESET]: {
        subject: 'Redefinir Senha — {{clinicName}}',
        body: 'Olá {{recipientName}}, utilize o código {{resetCode}} para redefinir a sua senha. Este código expira em 15 minutos.',
    },
};

@Injectable()
export class NotificationsService implements OnModuleInit {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(DeviceTokenEntity)
        private readonly deviceTokenRepository: Repository<DeviceTokenEntity>,
    ) { }

    onModuleInit() {
        if (process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            try {
                if (admin.apps.length === 0) {
                    admin.initializeApp({
                        credential: admin.credential.applicationDefault(),
                    });
                    this.logger.log('Firebase Admin initialized successfully');
                }
            } catch (error) {
                this.logger.error('Failed to initialize Firebase Admin', error);
            }
        } else {
            this.logger.warn('Firebase credentials not found. Push notifications will be disabled.');
        }
    }

    /**
     * Register a device token for push notifications
     */
    async registerDevice(userId: string, token: string, platform: DevicePlatform): Promise<void> {
        const existingToken = await this.deviceTokenRepository.findOne({ where: { token } });

        if (existingToken) {
            existingToken.userId = userId;
            existingToken.platform = platform;
            await this.deviceTokenRepository.save(existingToken);
        } else {
            await this.deviceTokenRepository.save({
                userId,
                token,
                platform,
            });
        }
        this.logger.log(`Device registered: ${userId} (${platform})`);
    }

    /**
     * Send a notification via the appropriate channel.
     * Currently stubs all providers — replace with real provider SDKs.
     */
    async send(payload: NotificationPayload): Promise<NotificationResult> {
        const template = TEMPLATES[payload.template];
        if (!template) {
            return { success: false, error: `Unknown template: ${payload.template}` };
        }

        const renderedBody = this.renderTemplate(template.body, {
            recipientName: payload.recipientName,
            ...payload.data,
        });

        const renderedSubject = this.renderTemplate(template.subject, {
            recipientName: payload.recipientName,
            ...payload.data,
        });

        switch (payload.channel) {
            case NotificationChannel.SMS:
                return this.sendSms(payload.recipientPhone!, renderedBody, payload.tenantId);
            case NotificationChannel.EMAIL:
                return this.sendEmail(payload.recipientEmail!, renderedSubject, renderedBody, payload.tenantId);
            case NotificationChannel.WHATSAPP:
                return this.sendWhatsApp(payload.recipientPhone!, renderedBody, payload.tenantId);
            case NotificationChannel.PUSH:
                return this.sendPush(payload.userId || payload.recipientName, renderedSubject, renderedBody, payload.tenantId);
            default:
                return { success: false, error: `Unsupported channel: ${payload.channel}` };
        }
    }

    /**
     * Send appointment reminder (convenience method)
     */
    async sendAppointmentReminder(
        recipientName: string,
        recipientPhone: string,
        animalName: string,
        date: string,
        time: string,
        clinicName: string,
        tenantId: string,
    ): Promise<NotificationResult> {
        return this.send({
            channel: NotificationChannel.SMS,
            template: NotificationTemplate.APPOINTMENT_REMINDER,
            recipientPhone,
            recipientName,
            locale: 'pt-AO',
            tenantId,
            data: { animalName, date, time, clinicName },
        });
    }

    /**
     * Send vaccine due alert
     */
    async sendVaccineDueAlert(
        recipientName: string,
        recipientPhone: string,
        animalName: string,
        vaccineName: string,
        dueDate: string,
        clinicName: string,
        tenantId: string,
    ): Promise<NotificationResult> {
        return this.send({
            channel: NotificationChannel.SMS,
            template: NotificationTemplate.VACCINE_DUE,
            recipientPhone,
            recipientName,
            locale: 'pt-AO',
            tenantId,
            data: { animalName, vaccineName, dueDate, clinicName },
        });
    }

    // ── Provider Stubs ─────────────────────────────────

    private async sendSms(phone: string, body: string, tenantId: string): Promise<NotificationResult> {
        // TODO: Integrate with Angola SMS provider (e.g., Unitel SMS API, Africell)
        this.logger.log(`[SMS STUB] To: ${phone} | Tenant: ${tenantId}`);
        this.logger.debug(`[SMS STUB] Body: ${body}`);

        // Simulate network latency
        await this.delay(100);

        return {
            success: true,
            messageId: `sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            provider: 'stub',
        };
    }

    private async sendEmail(email: string, subject: string, body: string, tenantId: string): Promise<NotificationResult> {
        // TODO: Integrate with email provider (SendGrid, AWS SES, etc.)
        this.logger.log(`[EMAIL STUB] To: ${email} | Subject: ${subject} | Tenant: ${tenantId}`);

        await this.delay(100);

        return {
            success: true,
            messageId: `email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            provider: 'stub',
        };
    }

    private async sendWhatsApp(phone: string, body: string, tenantId: string): Promise<NotificationResult> {
        // TODO: Integrate with WhatsApp Business API
        this.logger.log(`[WHATSAPP STUB] To: ${phone} | Tenant: ${tenantId}`);

        await this.delay(100);

        return {
            success: true,
            messageId: `wa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            provider: 'stub',
        };
    }

    private async sendPush(userId: string, title: string, body: string, tenantId: string): Promise<NotificationResult> {
        if (admin.apps.length === 0) {
            this.logger.warn('Firebase not initialized, skipping push notification');
            return { success: false, error: 'Firebase not initialized' };
        }

        const tokens = await this.deviceTokenRepository.find({ where: { userId } });
        if (!tokens || tokens.length === 0) {
            this.logger.warn(`No device tokens found for user ${userId}`);
            return { success: false, error: 'No device tokens found' };
        }

        const message: admin.messaging.MulticastMessage = {
            tokens: tokens.map((t) => t.token),
            notification: {
                title,
                body,
            },
            data: {
                tenantId,
            },
        };

        try {
            const response = await admin.messaging().sendEachForMulticast(message);
            const invalidTokens: string[] = [];

            response.responses.forEach((resp, idx) => {
                if (!resp.success && resp.error) {
                    const error = resp.error;
                    if (
                        error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered'
                    ) {
                        invalidTokens.push(tokens[idx].token);
                    }
                }
            });

            if (invalidTokens.length > 0) {
                await this.deviceTokenRepository.delete({ token: In(invalidTokens) });
            }

            return {
                success: response.successCount > 0,
                messageId: `push_${Date.now()}_${response.successCount}_sent`,
                provider: 'firebase',
                error: response.failureCount > 0 ? `Failed to send to ${response.failureCount} devices` : undefined,
            };
        } catch (error) {
            this.logger.error('Error sending push notification', error);
            return { success: false, error: error.message };
        }
    }

    // ── Helpers ────────────────────────────────────────

    private renderTemplate(template: string, data: Record<string, string>): string {
        return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || `{{${key}}}`);
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
