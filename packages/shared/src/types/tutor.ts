// ============================================================================
// Tutor (Animal Owner) Types
// ============================================================================

export interface TutorDto {
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    phoneSecondary?: string;
    documentType?: DocumentType;
    documentNumber?: string;
    address?: string;
    city?: string;
    province?: string;
    notes?: string;
    animals: AnimalSummary[];
    consents: ConsentRecord[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTutorDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    phoneSecondary?: string;
    documentType?: DocumentType;
    documentNumber?: string;
    address?: string;
    city?: string;
    province?: string;
    notes?: string;
}

export interface UpdateTutorDto extends Partial<CreateTutorDto> { }

export type DocumentType = 'BI' | 'PASSPORT' | 'RESIDENCE_CARD' | 'OTHER';

export interface AnimalSummary {
    id: string;
    name: string;
    species: string;
    breed?: string;
}

// Lei n.º 22/11 compliance
export interface ConsentRecord {
    id: string;
    tutorId: string;
    consentType: ConsentType;
    version: number;
    grantedAt: Date;
    revokedAt?: Date;
    ipAddress?: string;
    details?: string;
}

export type ConsentType =
    | 'DATA_PROCESSING'       // General data processing
    | 'CLINICAL_DATA'         // Clinical/health data
    | 'MARKETING'             // Marketing communications
    | 'DATA_SHARING'          // Sharing with third parties
    | 'TELECONSULT_RECORDING' // Video consultation recording
    | 'PHOTO_USAGE';          // Photo usage agreement
