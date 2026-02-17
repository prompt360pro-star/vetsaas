// ============================================================================
// Species & Breeds Constants
// ============================================================================

export const SPECIES = [
    { code: 'CANINE', label: 'Cão', labelEn: 'Dog', icon: '🐕' },
    { code: 'FELINE', label: 'Gato', labelEn: 'Cat', icon: '🐈' },
    { code: 'EQUINE', label: 'Cavalo', labelEn: 'Horse', icon: '🐴' },
    { code: 'BOVINE', label: 'Bovino', labelEn: 'Bovine', icon: '🐄' },
    { code: 'OVINE', label: 'Ovino', labelEn: 'Ovine', icon: '🐑' },
    { code: 'CAPRINE', label: 'Caprino', labelEn: 'Caprine', icon: '🐐' },
    { code: 'PORCINE', label: 'Suíno', labelEn: 'Porcine', icon: '🐷' },
    { code: 'AVIAN', label: 'Ave', labelEn: 'Bird', icon: '🐦' },
    { code: 'REPTILE', label: 'Réptil', labelEn: 'Reptile', icon: '🦎' },
    { code: 'EXOTIC', label: 'Exótico', labelEn: 'Exotic', icon: '🦜' },
    { code: 'OTHER', label: 'Outro', labelEn: 'Other', icon: '🐾' },
] as const;

export type SpeciesCode = typeof SPECIES[number]['code'];

// Common dog breeds (popular in Angola)
export const DOG_BREEDS = [
    'Sem Raça Definida (SRD)',
    'Pastor Alemão',
    'Rottweiler',
    'Labrador Retriever',
    'Golden Retriever',
    'Pit Bull Terrier',
    'Bulldog',
    'Poodle',
    'Boerboel',
    'Fila Brasileiro',
    'Dogue Alemão',
    'Dobermann',
    'Husky Siberiano',
    'Yorkshire Terrier',
    'Shih Tzu',
    'Chihuahua',
    'Boxer',
    'Pinscher',
    'Beagle',
    'Cocker Spaniel',
    'Outra',
] as const;

// Common cat breeds
export const CAT_BREEDS = [
    'Sem Raça Definida (SRD)',
    'Persa',
    'Siamês',
    'Maine Coon',
    'Bengal',
    'British Shorthair',
    'Ragdoll',
    'Sphynx',
    'Abissínio',
    'Angorá',
    'Outra',
] as const;

// Angola provinces for address fields
export const ANGOLA_PROVINCES = [
    'Bengo',
    'Benguela',
    'Bié',
    'Cabinda',
    'Cuando Cubango',
    'Cuanza Norte',
    'Cuanza Sul',
    'Cunene',
    'Huambo',
    'Huíla',
    'Luanda',
    'Lunda Norte',
    'Lunda Sul',
    'Malanje',
    'Moxico',
    'Namibe',
    'Uíge',
    'Zaire',
] as const;
