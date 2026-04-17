/**
 * Phone number normalization utilities for Egyptian phone numbers.
 * Handles various formats: 01x, +201x, 201x, with/without spaces/dashes.
 */

/**
 * Normalize an Egyptian phone number to consistent `01xxxxxxxxx` format.
 * Strips spaces, dashes, parentheses, and country code prefixes.
 */
export function normalizePhone(phone: string | null | undefined): string {
    if (!phone) return '';

    // Strip whitespace, dashes, parentheses, dots
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

    // Remove Egypt country code prefix variations
    // +201xxxxxxxx → 01xxxxxxxx
    if (cleaned.startsWith('+20') && cleaned.length >= 13) {
        cleaned = '0' + cleaned.slice(3);
    }
    // 201xxxxxxxx → 01xxxxxxxx (12 digits starting with 20)
    else if (cleaned.startsWith('20') && cleaned.length === 12 && /^20[01]/.test(cleaned)) {
        cleaned = '0' + cleaned.slice(2);
    }

    // If 10 digits starting with 1 (missing leading zero): 1xxxxxxxxx → 01xxxxxxxxx
    if (cleaned.length === 10 && /^1[0-9]{9}$/.test(cleaned)) {
        cleaned = '0' + cleaned;
    }

    return cleaned;
}

/**
 * Generate phone number search variants for a given input.
 * Returns an array of possible formats to match against DB records.
 */
export function phoneMatchVariants(phone: string): string[] {
    const norm = normalizePhone(phone);
    if (!norm) return [phone];

    const variants = new Set<string>();

    // Add the normalized form: 01xxxxxxxxx
    variants.add(norm);

    // Without leading zero: 1xxxxxxxxx
    if (norm.startsWith('0')) {
        variants.add(norm.slice(1));
    }

    // With +20 prefix: +201xxxxxxxxx
    if (norm.startsWith('0')) {
        variants.add('+2' + norm);
    }

    // With 20 prefix (no +): 201xxxxxxxxx
    if (norm.startsWith('0')) {
        variants.add('2' + norm);
    }

    // Also add the original input (trimmed) in case it's an unusual format
    const trimmed = phone.trim();
    if (trimmed) variants.add(trimmed);

    return Array.from(variants).filter(v => v.length >= 6);
}

/**
 * Check if two phone numbers are equivalent after normalization.
 */
export function phonesMatch(phone1: string | null | undefined, phone2: string | null | undefined): boolean {
    if (!phone1 || !phone2) return false;
    return normalizePhone(phone1) === normalizePhone(phone2);
}
