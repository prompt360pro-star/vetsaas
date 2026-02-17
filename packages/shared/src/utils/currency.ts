// ============================================================================
// Currency Utilities (Angola — Kwanza / AOA)
// ============================================================================

/**
 * Format a number as Angolan Kwanza (AOA) currency.
 * Uses pt-AO locale for proper formatting.
 */
export function formatKwanza(amount: number): string {
    return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format a number as compact currency (e.g., "1.2M Kz").
 */
export function formatKwanzaCompact(amount: number): string {
    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1)}M Kz`;
    }
    if (amount >= 1_000) {
        return `${(amount / 1_000).toFixed(1)}K Kz`;
    }
    return `${amount.toFixed(2)} Kz`;
}

/**
 * Parse a Kwanza string back to number.
 */
export function parseKwanza(value: string): number {
    const cleaned = value
        .replace(/[^\d,.-]/g, '')
        .replace(',', '.');
    return parseFloat(cleaned) || 0;
}

/**
 * Calculate percentage.
 */
export function percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 10000) / 100;
}
