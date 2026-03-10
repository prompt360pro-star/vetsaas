// ============================================================================
// Auth Service — Unit Tests
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserEntity } from './user.entity';
import { TenantsService } from '../tenants/tenants.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('$2a$12$hashedPassword'),
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;
    let userRepo: any;
    let jwtService: any;

    const mockUser: Partial<UserEntity> = {
        id: 'user-uuid-1',
        email: 'vet@clinica.ao',
        passwordHash: '$2a$12$hashedPassword',
        firstName: 'António',
        lastName: 'Silva',
        role: 'VETERINARIAN',
        tenantId: 'tenant-uuid-1',
        isActive: true,
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mock-jwt-token'),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string, defaultValue?: string) => defaultValue ?? 'test-secret'),
                    },
                },
                {
                    provide: TenantsService,
                    useValue: {
                        generateSlug: jest.fn().mockReturnValue('clinica-vetangola'),
                        create: jest.fn().mockResolvedValue({ id: 'tenant-uuid-1', name: 'VetAngola' }),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepo = module.get(getRepositoryToken(UserEntity));
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should hash password and create user', async () => {
            userRepo.findOne.mockResolvedValue(null);
            userRepo.create.mockReturnValue(mockUser);
            userRepo.save.mockResolvedValue(mockUser);

            const result = await service.register({
                email: 'vet@clinica.ao',
                password: 'SecurePass123!',
                firstName: 'António',
                lastName: 'Silva',
                clinicName: 'Clínica VetAngola',
            });

            expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 12);
            expect(userRepo.save).toHaveBeenCalled();
            expect(result).toHaveProperty('accessToken');
        });

        it('should reject duplicate email', async () => {
            userRepo.findOne.mockResolvedValue(mockUser);

            await expect(
                service.register({
                    email: 'vet@clinica.ao',
                    password: 'Pass123!',
                    firstName: 'Ana',
                    lastName: 'Santos',
                    clinicName: 'Outra Clínica',
                }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        it('should return tokens for valid credentials', async () => {
            userRepo.findOne.mockResolvedValue(mockUser);
            userRepo.save.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.login('vet@clinica.ao', 'SecurePass123!');

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(jwtService.sign).toHaveBeenCalled();
        });

        it('should reject invalid password', async () => {
            userRepo.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.login('vet@clinica.ao', 'WrongPassword'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should reject non-existent user', async () => {
            userRepo.findOne.mockResolvedValue(null);

            await expect(
                service.login('nobody@clinica.ao', 'Anything'),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
