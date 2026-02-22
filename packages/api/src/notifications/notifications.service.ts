// ============================================================================
// Notification Service — SMS / Email / Push
// ============================================================================

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { DeviceTokenEntity } from './device-token.entity';

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
    private firebaseApp: admin.app.App | undefined;

    constructor(
        @InjectRepository(DeviceTokenEntity)
        private readonly deviceTokenRepository: Repository<DeviceTokenEntity>,
        private readonly configService: ConfigService,
    ) {}

    onModuleInit() {
        this.initializeFirebase();
    }

    private initializeFirebase() {
        if (admin.apps.length > 0) {
            this.firebaseApp = admin.apps[0]!;
            return;
        }

        try {
            const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');

            if (serviceAccountPath) {
                 // eslint-disable-next-line @typescript-eslint/no-var-requires
                const serviceAccount = require(serviceAccountPath);
                this.firebaseApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            } else {
                this.firebaseApp = admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                });
            }
            this.logger.log('Firebase Admin initialized');
        } catch (error) {
            this.logger.warn(`Failed to initialize Firebase Admin: ${error.message}`);
        }
    }

    async registerDevice(userId: string, token: string, platform: string): Promise<void> {
        let existing = await this.deviceTokenRepository.findOne({ where: { token } });

        if (existing) {
            existing.userId = userId;
            existing.platform = platform;
            await this.deviceTokenRepository.save(existing);
        } else {
            await this.deviceTokenRepository.save({
                userId,
                token,
                platform,
            });
        }
        this.logger.log(`Device registered for user ${userId}`);
    }

    /**
     * Send a notification via the appropriate channel.
     * Currently stubs SMS/Email/WhatsApp but uses real Push provider.
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
                const targetUserId = payload.userId || payload.recipientName;
                return this.sendPush(targetUserId, renderedSubject, renderedBody, payload.tenantId);
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
        if (!this.firebaseApp) {
             this.logger.warn('Firebase not initialized, skipping push notification');
             return { success: false, error: 'Firebase not initialized' };
        }

        const tokens = await this.deviceTokenRepository.find({ where: { userId } });
        if (tokens.length === 0) {
            this.logger.log(`No device tokens found for user ${userId}`);
            return { success: false, error: 'No device tokens found' };
        }

        const fcmTokens = tokens.map(t => t.token);

        try {
            const response = await this.firebaseApp.messaging().sendEachForMulticast({
                tokens: fcmTokens,
                notification: {
                    title,
                    body,
                },
                data: {
                    tenantId,
                },
            });

            // Handle invalid tokens
            if (response.failureCount > 0) {
                 const tokensToDelete: string[] = [];
                 response.responses.forEach((resp, idx) => {
                     if (!resp.success) {
                         const error = resp.error;
                         if (
                             error?.code === 'messaging/invalid-registration-token' ||
                             error?.code === 'messaging/registration-token-not-registered'
                         ) {
                             tokensToDelete.push(fcmTokens[idx]);
                         }
                     }
                 });

                 if (tokensToDelete.length > 0) {
                     await this.deviceTokenRepository.delete(
                         // Find tokens by token string
                         tokens.filter(t => tokensToDelete.includes(t.token)).map(t => t.id)
                     );
                     this.logger.log(`Removed ${tokensToDelete.length} invalid tokens for user ${userId}`);
                 }
            }

            return {
                success: response.successCount > 0,
                messageId: `push_batch_${Date.now()}`,
                provider: 'firebase',
            };

        } catch (error) {
            this.logger.error(`Error sending push notification: ${error.message}`, error.stack);
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
