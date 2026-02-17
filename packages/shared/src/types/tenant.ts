// ============================================================================
// Tenant Types
// ============================================================================

export interface TenantDto {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    country: string;
    logoUrl?: string;
    settings: TenantSettings;
    plan: TenantPlan;
    isActive: boolean;
    createdAt: Date;
}

export interface TenantSettings {
    currency: string;              // AOA (Kwanza)
    timezone: string;              // Africa/Luanda
    locale: string;                // pt-AO
    appointmentDuration: number;   // minutes
    workingHoursStart: string;     // "08:00"
    workingHoursEnd: string;       // "18:00"
    workingDays: number[];         // [1,2,3,4,5] Mon-Fri
    allowOnlineBooking: boolean;
    allowTeleconsult: boolean;
    fiscalId?: string;             // NIF Angola
}

export type TenantPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
