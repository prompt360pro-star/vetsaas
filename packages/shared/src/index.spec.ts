// ============================================================================
// Shared Package — Utility Tests
// ============================================================================

import {
    formatKwanza,
    formatKwanzaCompact,
    parseKwanza,
    percentage,
    isValidAngolanPhone,
    isValidBI,
    isValidNIF,
    isValidMicrochip,
    isValidEmail,
    generateReadableId,
    ANGOLA_PROVINCES,
    SPECIES,
    ROLES,
    ROLE_HIERARCHY,
} from '.';

describe('@vetsaas/shared', () => {
    describe('formatKwanza', () => {
        it('should format amount as AOA currency', () => {
            const result = formatKwanza(15000);
            expect(result).toContain('Kz');
        });

        it('should handle zero', () => {
            const result = formatKwanza(0);
            expect(result).toContain('0');
        });

        it('should include decimal digits', () => {
            const result = formatKwanza(1234.56);
            expect(result).toBeDefined();
        });
    });

    describe('formatKwanzaCompact', () => {
        it('should format millions with M suffix', () => {
            expect(formatKwanzaCompact(1_500_000)).toBe('1.5M Kz');
        });

        it('should format thousands with K suffix', () => {
            expect(formatKwanzaCompact(15_000)).toBe('15.0K Kz');
        });

        it('should format small numbers directly', () => {
            expect(formatKwanzaCompact(500)).toBe('500.00 Kz');
        });
    });

    describe('parseKwanza', () => {
        it('should parse numeric string', () => {
            expect(parseKwanza('15000')).toBe(15000);
        });

        it('should handle empty string', () => {
            expect(parseKwanza('')).toBe(0);
        });
    });

    describe('percentage', () => {
        it('should calculate percentage', () => {
            expect(percentage(50, 200)).toBe(25);
        });

        it('should handle zero total', () => {
            expect(percentage(50, 0)).toBe(0);
        });
    });

    describe('isValidAngolanPhone', () => {
        it('should accept valid +244 numbers', () => {
            expect(isValidAngolanPhone('+244923456789')).toBe(true);
            expect(isValidAngolanPhone('+244912345678')).toBe(true);
        });

        it('should accept numbers without prefix', () => {
            expect(isValidAngolanPhone('923456789')).toBe(true);
        });

        it('should reject invalid numbers', () => {
            expect(isValidAngolanPhone('123')).toBe(false);
            expect(isValidAngolanPhone('')).toBe(false);
        });
    });

    describe('isValidBI', () => {
        it('should accept valid BI format (9 digits + 2 letters + 3 digits)', () => {
            expect(isValidBI('000000000LA001')).toBe(true);
            expect(isValidBI('123456789AB012')).toBe(true);
        });

        it('should reject invalid format', () => {
            expect(isValidBI('123')).toBe(false);
            expect(isValidBI('')).toBe(false);
        });
    });

    describe('isValidNIF', () => {
        it('should accept 10-digit NIF', () => {
            expect(isValidNIF('5417123456')).toBe(true);
            expect(isValidNIF('1234567890')).toBe(true);
        });

        it('should reject invalid NIF', () => {
            expect(isValidNIF('123')).toBe(false);
            expect(isValidNIF('')).toBe(false);
        });
    });

    describe('isValidMicrochip', () => {
        it('should accept 15-digit microchip', () => {
            expect(isValidMicrochip('123456789012345')).toBe(true);
        });

        it('should reject invalid microchip', () => {
            expect(isValidMicrochip('12345')).toBe(false);
            expect(isValidMicrochip('')).toBe(false);
        });
    });

    describe('isValidEmail', () => {
        it('should accept valid emails', () => {
            expect(isValidEmail('vet@clinica.ao')).toBe(true);
            expect(isValidEmail('admin@vetsaas.com')).toBe(true);
        });

        it('should reject invalid emails', () => {
            expect(isValidEmail('notanemail')).toBe(false);
            expect(isValidEmail('')).toBe(false);
        });
    });

    describe('generateReadableId', () => {
        it('should generate ID with prefix and padded sequence', () => {
            const id = generateReadableId('FAT', 42);
            expect(id).toMatch(/^FAT-\d{4}-000042$/);
        });
    });

    describe('constants', () => {
        it('should have all 18 Angola provinces', () => {
            expect(ANGOLA_PROVINCES).toHaveLength(18);
            expect(ANGOLA_PROVINCES).toContain('Luanda');
            expect(ANGOLA_PROVINCES).toContain('Benguela');
            expect(ANGOLA_PROVINCES).toContain('Huambo');
            expect(ANGOLA_PROVINCES).toContain('Cabinda');
        });

        it('should have species with Portuguese labels', () => {
            expect(SPECIES).toBeDefined();
            expect(SPECIES.length).toBeGreaterThan(0);
            expect(SPECIES[0]).toHaveProperty('label');
            expect(SPECIES[0]).toHaveProperty('code');
        });

        it('should have ROLES defined with CLINIC_ADMIN and VETERINARIAN', () => {
            expect(ROLES).toBeDefined();
            const roleCodes = ROLES.map(r => r.role);
            expect(roleCodes).toContain('CLINIC_ADMIN');
            expect(roleCodes).toContain('VETERINARIAN');
        });

        it('should have ROLE_HIERARCHY', () => {
            expect(ROLE_HIERARCHY).toBeDefined();
            expect(ROLE_HIERARCHY.SUPER_ADMIN).toContain('CLINIC_ADMIN');
        });
    });
});
