// ============================================================================
// Animal Types
// ============================================================================

export interface AnimalDto {
    id: string;
    tenantId: string;
    name: string;
    species: string;
    breed?: string;
    color?: string;
    sex: AnimalSex;
    dateOfBirth?: Date;
    estimatedAge?: string;
    weight?: number;
    weightUnit: 'kg' | 'g';
    microchipId?: string;
    pedigreeNumber?: string;
    photoUrl?: string;
    photos: string[];
    isNeutered: boolean;
    isDeceased: boolean;
    deceasedDate?: Date;
    bloodType?: string;
    notes?: string;
    tutors: TutorSummary[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAnimalDto {
    name: string;
    species: string;
    breed?: string;
    color?: string;
    sex: AnimalSex;
    dateOfBirth?: string;
    estimatedAge?: string;
    weight?: number;
    weightUnit?: 'kg' | 'g';
    microchipId?: string;
    pedigreeNumber?: string;
    isNeutered?: boolean;
    bloodType?: string;
    notes?: string;
    tutorIds?: string[];
}

export interface UpdateAnimalDto extends Partial<CreateAnimalDto> { }

export type AnimalSex = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface TutorSummary {
    id: string;
    name: string;
    phone?: string;
}

export interface AnimalVaccination {
    id: string;
    animalId: string;
    vaccineName: string;
    batchNumber?: string;
    manufacturer?: string;
    administeredAt: Date;
    administeredBy: string;
    nextDueDate?: Date;
    notes?: string;
}

export interface AnimalAllergy {
    id: string;
    animalId: string;
    allergen: string;
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
    reaction?: string;
    diagnosedAt?: Date;
    isActive: boolean;
}

export interface AnimalMedication {
    id: string;
    animalId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    route: string;
    startDate: Date;
    endDate?: Date;
    prescribedBy: string;
    isActive: boolean;
    notes?: string;
}
