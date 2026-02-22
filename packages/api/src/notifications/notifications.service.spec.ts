// ============================================================================
// Notifications Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService, NotificationChannel, NotificationTemplate } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeviceTokenEntity } from './device-token.entity';
import { ConfigService } from '@nestjs/config';

// Mock firebase-admin
const mockMessaging = {
    sendEachForMulticast: jest.fn().mockResolvedValue({
        successCount: 1,
        failureCount: 0,
        responses: [{ success: true }],
    }),
};

jest.mock('firebase-admin', () => ({
    apps: [],
    initializeApp: jest.fn(() => ({
        messaging: jest.fn(() => mockMessaging),
    })),
    credential: {
        cert: jest.fn(),
        applicationDefault: jest.fn(),
    },
}));

describe('NotificationsService', () => {
    let service: NotificationsService;
    let deviceTokenRepo: any;
    let configService: any;

    const mockDeviceTokenRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        delete: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'FIREBASE_SERVICE_ACCOUNT_PATH') return null;
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                {
                    provide: getRepositoryToken(DeviceTokenEntity),
                    useValue: mockDeviceTokenRepo,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
        deviceTokenRepo = module.get(getRepositoryToken(DeviceTokenEntity));
        configService = module.get(ConfigService);

        // Initialize firebase
        service.onModuleInit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('registerDevice', () => {
        it('should register a new device token', async () => {
            mockDeviceTokenRepo.findOne.mockResolvedValue(null);
            mockDeviceTokenRepo.save.mockResolvedValue({ id: '1', userId: 'user-1', token: 'token-1', platform: 'WEB' });

            await service.registerDevice('user-1', 'token-1', 'WEB');

            expect(mockDeviceTokenRepo.findOne).toHaveBeenCalledWith({ where: { token: 'token-1' } });
            expect(mockDeviceTokenRepo.save).toHaveBeenCalledWith({ userId: 'user-1', token: 'token-1', platform: 'WEB' });
        });

        it('should update an existing device token', async () => {
            const existingToken = { id: '1', userId: 'user-old', token: 'token-1', platform: 'WEB' };
            mockDeviceTokenRepo.findOne.mockResolvedValue(existingToken);
            mockDeviceTokenRepo.save.mockResolvedValue({ ...existingToken, userId: 'user-1' });

            await service.registerDevice('user-1', 'token-1', 'WEB');

            expect(mockDeviceTokenRepo.findOne).toHaveBeenCalledWith({ where: { token: 'token-1' } });
            expect(existingToken.userId).toBe('user-1');
            expect(mockDeviceTokenRepo.save).toHaveBeenCalledWith(existingToken);
        });
    });

    describe('send', () => {
        it('should send SMS notification successfully', async () => {
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

        it('should send push notification successfully', async () => {
            mockDeviceTokenRepo.find.mockResolvedValue([{ token: 'fcm-token-1' }]);

            const result = await service.send({
                channel: NotificationChannel.PUSH,
                template: NotificationTemplate.WELCOME,
                recipientName: 'João Silva',
                userId: 'user-1',
                locale: 'pt-AO',
                tenantId: 'tenant-1',
                data: { clinicName: 'VetAngola', loginUrl: 'url' },
            });

            expect(mockDeviceTokenRepo.find).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
            expect(mockMessaging.sendEachForMulticast).toHaveBeenCalledWith(expect.objectContaining({
                tokens: ['fcm-token-1'],
                notification: expect.objectContaining({
                    title: expect.stringContaining('Bem-vindo'),
                }),
            }));
            expect(result.success).toBe(true);
            expect(result.provider).toBe('firebase');
        });

        it('should fallback to recipientName as userId if userId missing', async () => {
             mockDeviceTokenRepo.find.mockResolvedValue([{ token: 'fcm-token-1' }]);

             await service.send({
                channel: NotificationChannel.PUSH,
                template: NotificationTemplate.WELCOME,
                recipientName: 'user-1', // acting as ID
                locale: 'pt-AO',
                tenantId: 'tenant-1',
                data: { clinicName: 'VetAngola', loginUrl: 'url' },
            });

            expect(mockDeviceTokenRepo.find).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
        });

        it('should handle no device tokens', async () => {
            mockDeviceTokenRepo.find.mockResolvedValue([]);

            const result = await service.send({
                channel: NotificationChannel.PUSH,
                template: NotificationTemplate.WELCOME,
                userId: 'user-1',
                recipientName: 'João',
                locale: 'pt-AO',
                tenantId: 'tenant-1',
                data: { clinicName: 'VetAngola', loginUrl: 'url' },
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('No device tokens found');
        });
    });

    describe('sendAppointmentReminder', () => {
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
    });

    describe('sendVaccineDueAlert', () => {
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
