// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate Angolan phone number.
 * Angola numbers: +244 followed by 9 digits (9xx xxx xxx).
 */
export function isValidAngolanPhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^(\+244)?9\d{8}$/.test(cleaned);
}

/**
 * Format Angolan phone number.
 */
export function formatAngolanPhone(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const digits = cleaned.replace('+244', '');
    if (digits.length === 9) {
        return `+244 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return phone;
}

/**
 * Validate Angolan BI (Bilhete de Identidade) number.
 * Format: 9 digits followed by 2 letters and 3 digits.
 */
export function isValidBI(bi: string): boolean {
    const cleaned = bi.replace(/[\s\-]/g, '');
    return /^\d{9}[A-Z]{2}\d{3}$/.test(cleaned);
}

/**
 * Validate NIF (Número de Identificação Fiscal) for Angola.
 * Format: 10 digits.
 */
export function isValidNIF(nif: string): boolean {
    const cleaned = nif.replace(/[\s\-]/g, '');
    return /^\d{10}$/.test(cleaned);
}

/**
 * Validate microchip number (ISO 11784/85).
 * 15 digits.
 */
export function isValidMicrochip(chip: string): boolean {
    const cleaned = chip.replace(/[\s\-]/g, '');
    return /^\d{15}$/.test(cleaned);
}

/**
 * Validate email.
 */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Generate a human-readable ID (for invoice numbers, etc.).
 */
export function generateReadableId(prefix: string, sequence: number): string {
    const year = new Date().getFullYear();
    const padded = String(sequence).padStart(6, '0');
    return `${prefix}-${year}-${padded}`;
}
