// ============================================================================
// Auth Types
// ============================================================================

export interface LoginDto {
    email: string;
    password: string;
    mfaCode?: string;
}

export interface RegisterDto {
    clinicName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface JwtPayload {
    sub: string;        // user id
    tenantId: string;   // tenant/clinic id
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

export interface RefreshTokenDto {
    refreshToken: string;
}

export interface MfaSetupResponse {
    secret: string;
    qrCodeUrl: string;
}

export type UserRole =
    | 'SUPER_ADMIN'
    | 'CLINIC_ADMIN'
    | 'VETERINARIAN'
    | 'TECHNICIAN'
    | 'RECEPTIONIST'
    | 'CLIENT';

export interface UserProfile {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    avatarUrl?: string;
    mfaEnabled: boolean;
    lastLoginAt?: Date;
}
