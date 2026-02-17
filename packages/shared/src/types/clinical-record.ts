// ============================================================================
// Clinical Record Types (SOAP)
// ============================================================================

export interface ClinicalRecordDto {
    id: string;
    tenantId: string;
    animalId: string;
    animalName: string;
    veterinarianId: string;
    veterinarianName: string;
    appointmentId?: string;
    version: number;
    recordType: RecordType;
    subjective?: string;   // S — Owner's complaint, history
    objective?: string;    // O — Exam findings, vitals
    assessment?: string;   // A — Diagnosis, differential
    plan?: string;         // P — Treatment plan
    vitals?: VitalSigns;
    templateId?: string;
    tags: string[];
    attachments: string[];
    signedAt?: Date;
    signedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateClinicalRecordDto {
    animalId: string;
    appointmentId?: string;
    recordType: RecordType;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    vitals?: VitalSigns;
    templateId?: string;
    tags?: string[];
}

export interface UpdateClinicalRecordDto extends Partial<CreateClinicalRecordDto> { }

export type RecordType =
    | 'CONSULTATION'
    | 'FOLLOW_UP'
    | 'EMERGENCY'
    | 'SURGERY'
    | 'VACCINATION'
    | 'LAB_RESULT'
    | 'IMAGING'
    | 'HOSPITALIZATION'
    | 'DISCHARGE';

export interface VitalSigns {
    temperature?: number;      // °C
    heartRate?: number;        // bpm
    respiratoryRate?: number;  // breaths/min
    weight?: number;           // kg
    bodyConditionScore?: number; // 1-9 scale
    painScore?: number;        // 0-10 scale
    bloodPressure?: {
        systolic: number;
        diastolic: number;
    };
    mucousMembranes?: string;
    capillaryRefillTime?: number; // seconds
    hydrationStatus?: string;
    notes?: string;
}

export interface ClinicalTemplate {
    id: string;
    tenantId?: string;       // null = global template
    name: string;
    specialty: string;
    recordType: RecordType;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    isDefault: boolean;
}
