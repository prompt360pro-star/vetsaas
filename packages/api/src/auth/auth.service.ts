import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './user.entity';
import { TenantsService } from '../tenants/tenants.service';
import type {
  JwtPayload,
  UserRole,
  AuthTokens,
  UserProfile,
} from '@vetsaas/shared';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tenantsService: TenantsService,
  ) {}

  /**
   * Register a new clinic (tenant) with its admin user.
   */
  async register(data: {
    clinicName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<AuthTokens> {
    // Check if email already exists across any tenant
    const existing = await this.usersRepo.findOne({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Create tenant
    const slug = this.tenantsService.generateSlug(data.clinicName);
    const tenant = await this.tenantsService.create({
      name: data.clinicName,
      slug,
      email: data.email,
      phone: data.phone,
    });

    // Create admin user
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = this.usersRepo.create({
      tenantId: tenant.id,
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: 'CLINIC_ADMIN',
    });
    await this.usersRepo.save(user);

    return this.generateTokens(user);
  }

  /**
   * Login with email and password.
   */
  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);

    return this.generateTokens(user);
  }

  /**
   * Refresh access token.
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
      const user = await this.usersRepo.findOne({
        where: { id: payload.sub },
      });
      if (!user || !user.isActive || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Get user profile.
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as UserRole,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * Update user profile fields.
   */
  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    },
  ): Promise<UserProfile> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;
    await this.usersRepo.save(user);
    return this.getProfile(userId);
  }

  /**
   * Change password with old password verification.
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersRepo.save(user);
  }

  /**
   * Generate JWT access + refresh tokens.
   */
  private async generateTokens(user: UserEntity): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Store refresh token hash
    user.refreshToken = refreshToken;
    await this.usersRepo.save(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
