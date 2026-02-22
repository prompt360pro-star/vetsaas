// ============================================================================
// Notifications Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificationsService, NotificationChannel, NotificationTemplate } from './notifications.service';
import * as sgMail from '@sendgrid/mail';

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
    setApiKey: jest.fn(),
    send: jest.fn(),
}));

describe('NotificationsService', () => {
    let service: NotificationsService;

    // Helper to setup service with specific config
    const setupService = async (configValues: Record<string, string | undefined>) => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => configValues[key]),
                    },
                },
            ],
        }).compile();

        return module.get<NotificationsService>(NotificationsService);
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Default Behavior (Stub)', () => {
        beforeEach(async () => {
            service = await setupService({});
        });

        it('should be defined', () => {
            expect(service).toBeDefined();
        });

        it('should send SMS notification successfully via stub', async () => {
            const result = await service.send({
                channel: NotificationChannel.SMS,
                template: NotificationTemplate.APPOINTMENT_REMINDER,
                recipientPhone: '+244 923 456 789',
                recipientName: 'João Silva',
                locale: 'pt-AO',
                tenantId: 'tenant-1',
                data: {
                    animalName: 'Rex',
                    date: '15/03/2025',
                    time: '09:00',
                    clinicName: 'VetAngola',
                },
            });

            expect(result.success).toBe(true);
            expect(result.messageId).toBeDefined();
            expect(result.provider).toBe('stub');
        });

        it('should send email notification successfully via stub (when no API key)', async () => {
            const result = await service.send({
                channel: NotificationChannel.EMAIL,
                template: NotificationTemplate.WELCOME,
                recipientEmail: 'joao@email.ao',
                recipientName: 'João Silva',
                locale: 'pt-AO',
                tenantId: 'tenant-1',
                data: { clinicName: 'VetAngola', loginUrl: 'https://app.vetangola.ao' },
            });

            expect(result.success).toBe(true);
            expect(result.messageId).toMatch(/^email_/);
            expect(result.provider).toBe('stub');
            expect(sgMail.send).not.toHaveBeenCalled();
        });

        it('should reject unknown template', async () => {
            const result = await service.send({
                channel: NotificationChannel.SMS,
                template: 'NONEXISTENT' as NotificationTemplate,
                recipientPhone: '+244 900 000 000',
                recipientName: 'Test',
                locale: 'pt-AO',
                tenantId: 'tenant-1',
                data: {},
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Unknown template');
        });
    });

    describe('SendGrid Integration', () => {
        beforeEach(async () => {
            service = await setupService({
                'SENDGRID_API_KEY': 'sg_test_api_key',
                'SENDGRID_SENDER_EMAIL': 'no-reply@vetangola.ao',
            });
        });

        it('should configure SendGrid on initialization', () => {
            expect(sgMail.setApiKey).toHaveBeenCalledWith('sg_test_api_key');
        });

        it('should send email via SendGrid when configured', async () => {
            (sgMail.send as jest.Mock).mockResolvedValueOnce([{
                headers: { 'x-message-id': 'sg_msg_id_123' },
            }]);

            const result = await service.send({
                channel: NotificationChannel.EMAIL,
                template: NotificationTemplate.WELCOME,
                recipientEmail: 'joao@email.ao',
                recipientName: 'João Silva',
                locale: 'pt-AO',
                tenantId: 'tenant-1',
                data: { clinicName: 'VetAngola', loginUrl: 'https://app.vetangola.ao' },
            });

            expect(sgMail.send).toHaveBeenCalledWith(expect.objectContaining({
                to: 'joao@email.ao',
                from: 'no-reply@vetangola.ao',
                subject: 'Bem-vindo ao VetAngola!',
                customArgs: { tenantId: 'tenant-1' },
            }));

            expect(result.success).toBe(true);
            expect(result.messageId).toBe('sg_msg_id_123');
            expect(result.provider).toBe('sendgrid');
        });

        it('should handle SendGrid errors gracefully', async () => {
            (sgMail.send as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

            const result = await service.send({
                channel: NotificationChannel.EMAIL,
                template: NotificationTemplate.WELCOME,
                recipientEmail: 'joao@email.ao',
                recipientName: 'João Silva',
                locale: 'pt-AO',
                tenantId: 'tenant-1',
                data: { clinicName: 'VetAngola', loginUrl: 'https://app.vetangola.ao' },
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('API Error');
            expect(result.provider).toBe('sendgrid');
        });
    });

    describe('Convenience Methods', () => {
        beforeEach(async () => {
            service = await setupService({});
        });

        it('should send appointment reminder via SMS', async () => {
            const result = await service.sendAppointmentReminder(
                'João Silva',
                '+244 923 456 789',
                'Rex',
                '15/03/2025',
                '09:00',
                'VetAngola',
                'tenant-1',
            );

            expect(result.success).toBe(true);
            expect(result.messageId).toMatch(/^sms_/);
        });

        it('should send vaccine due alert via SMS', async () => {
            const result = await service.sendVaccineDueAlert(
                'Ana Santos',
                '+244 912 345 678',
                'Mimi',
                'Antirrábica',
                '01/04/2025',
                'VetAngola',
                'tenant-1',
            );

            expect(result.success).toBe(true);
        });
    });
});
