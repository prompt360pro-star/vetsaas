// ============================================================================
// Appointment Types
// ============================================================================

export interface AppointmentDto {
    id: string;
    tenantId: string;
    animalId: string;
    animalName: string;
    tutorId: string;
    tutorName: string;
    veterinarianId: string;
    veterinarianName: string;
    scheduledAt: Date;
    duration: number;          // minutes
    appointmentType: AppointmentType;
    status: AppointmentStatus;
    reason?: string;
    notes?: string;
    isTeleconsult: boolean;
    teleconsultUrl?: string;
    checkedInAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAppointmentDto {
    animalId: string;
    tutorId: string;
    veterinarianId: string;
    scheduledAt: string;
    duration?: number;
    appointmentType: AppointmentType;
    reason?: string;
    notes?: string;
    isTeleconsult?: boolean;
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {
    status?: AppointmentStatus;
}

export type AppointmentType =
    | 'CONSULTATION'
    | 'FOLLOW_UP'
    | 'VACCINATION'
    | 'SURGERY'
    | 'GROOMING'
    | 'EMERGENCY'
    | 'LAB_WORK'
    | 'IMAGING'
    | 'OTHER';

export type AppointmentStatus =
    | 'SCHEDULED'
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';
