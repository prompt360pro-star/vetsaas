// ============================================================================
// Notifications Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService, NotificationChannel, NotificationTemplate } from './notifications.service';
import { DeviceTokenEntity, DevicePlatform } from './device-token.entity';
import * as admin from 'firebase-admin';

// Mock firebase-admin
const mockApps: any[] = [];
jest.mock('firebase-admin', () => {
    return {
        get apps() {
            return mockApps;
        },
        credential: {
            applicationDefault: jest.fn(),
        },
        initializeApp: jest.fn(),
        messaging: jest.fn(),
    };
});

describe('NotificationsService', () => {
    let service: NotificationsService;
    let repository: any;
    let messagingMock: any;

    beforeEach(async () => {
        // Reset mockApps
        mockApps.length = 0;
        mockApps.push({}); // Simulate initialized app by default

        messagingMock = {
            sendEachForMulticast: jest.fn().mockResolvedValue({
                successCount: 1,
                failureCount: 0,
                responses: [{ success: true }],
            }),
        };
        (admin.messaging as unknown as jest.Mock).mockReturnValue(messagingMock);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                {
                    provide: getRepositoryToken(DeviceTokenEntity),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
        repository = module.get(getRepositoryToken(DeviceTokenEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('registerDevice', () => {
        it('should create new token if not exists', async () => {
            repository.findOne.mockResolvedValue(null);

            await service.registerDevice('user-1', 'token-123', DevicePlatform.WEB);

            expect(repository.save).toHaveBeenCalledWith({
                userId: 'user-1',
                token: 'token-123',
                platform: DevicePlatform.WEB,
            });
        });

        it('should update existing token', async () => {
            const existing = { id: 'uuid', userId: 'old-user', token: 'token-123', platform: DevicePlatform.ANDROID };
            repository.findOne.mockResolvedValue(existing);

            await service.registerDevice('user-1', 'token-123', DevicePlatform.WEB);

            expect(repository.save).toHaveBeenCalledWith({
                ...existing,
                userId: 'user-1',
                platform: DevicePlatform.WEB,
            });
        });
    });

    describe('sendPush', () => {
        it('should return error if firebase not initialized', async () => {
            mockApps.length = 0; // Not initialized

            const result = await service.send({
                channel: NotificationChannel.PUSH,
                template: NotificationTemplate.APPOINTMENT_REMINDER,
                recipientName: 'John',
                userId: 'user-1',
                locale: 'en',
                tenantId: 'tenant-1',
                data: {},
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Firebase not initialized');
        });

        it('should return error if no tokens found', async () => {
            repository.find.mockResolvedValue([]);

            const result = await service.send({
                channel: NotificationChannel.PUSH,
                template: NotificationTemplate.APPOINTMENT_REMINDER,
                recipientName: 'John',
                userId: 'user-1',
                locale: 'en',
                tenantId: 'tenant-1',
                data: {},
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('No device tokens found');
        });

        it('should send push notification successfully', async () => {
            repository.find.mockResolvedValue([{ token: 'token-1' }]);

            const result = await service.send({
                channel: NotificationChannel.PUSH,
                template: NotificationTemplate.APPOINTMENT_REMINDER,
                recipientName: 'John',
                userId: 'user-1',
                locale: 'pt-AO',
                tenantId: 'tenant-1',
                data: {
                    recipientName: 'John',
                    animalName: 'Rex',
                    date: '15/03/2025',
                    time: '09:00',
                    clinicName: 'VetAngola',
                },
            });

            expect(repository.find).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
            expect(messagingMock.sendEachForMulticast).toHaveBeenCalled();
            expect(result.success).toBe(true);
            expect(result.provider).toBe('firebase');
        });

        it('should delete invalid tokens', async () => {
             repository.find.mockResolvedValue([{ token: 'token-1' }, { token: 'token-2' }]);
             messagingMock.sendEachForMulticast.mockResolvedValue({
                 successCount: 1,
                 failureCount: 1,
                 responses: [
                     { success: true },
                     { success: false, error: { code: 'messaging/invalid-registration-token' } },
                 ],
             });

             await service.send({
                 channel: NotificationChannel.PUSH,
                 template: NotificationTemplate.APPOINTMENT_REMINDER,
                 recipientName: 'John',
                 userId: 'user-1',
                 locale: 'en',
                 tenantId: 'tenant-1',
                 data: {},
             });

             expect(repository.delete).toHaveBeenCalled();
        });
    });

    describe('send (other channels)', () => {
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
    });
});
