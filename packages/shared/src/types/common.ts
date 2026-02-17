// ============================================================================
// Common Types
// ============================================================================

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
}

export interface ApiResponse<T = void> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface AuditFields {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    createdBy?: string;
    updatedBy?: string;
}

export interface DashboardStatsDto {
    totalAnimals: number;
    totalTutors: number;
    todayAppointments: number;
    monthlyRevenue: number;
    animalsChange: number;
    tutorsChange: number;
    appointmentsChange: number;
    revenueChange: number;
}

export interface AuditLogDto {
    id: string;
    tenantId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

export interface ClinicalTemplateDto {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    color: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    defaultVitals: string[];
    tags: string[];
}

export interface ClinicalAlertDto {
    id: string;
    type: 'WARNING' | 'DANGER' | 'INFO';
    category: string;
    title: string;
    description: string;
    entityType: string;
    entityId?: string;
    entityName?: string;
    createdAt: Date;
}
