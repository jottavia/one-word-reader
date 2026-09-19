export interface Token {
    type: 'text' | 'image';
    value: string; // word or imageUrl
    orpIndex: number; // 0 for images
    delayMultiplier: number;
    cfi?: string;
}

export const calculateORP = (word: string): number => {
    const len = word.length;
    if (len <= 1) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
};

export type RawItem = { type: 'text' | 'image'; value: string; cfi?: string };

const SHORT_NOISE_PATTERNS = [
    /^[ivxlcdm]{2,}$/i,     // Roman numerals (front matter) — {2,} so single "I" is kept
    /^Page \d+/i         // Page footers
];

const LONG_NOISE_PATTERNS = [
    /^ISBN \d+/i,        // ISBN metadata
    /^Copyright/i,       // Copyright blurb
    /^All rights reserved/i
];

export const processText = (inputs: RawItem[] | string): Token[] => {
    let rawItems: RawItem[] = [];

    if (typeof inputs === 'string') {
        rawItems = inputs.trim().split(/[\s\n]+/).map(w => ({ type: 'text', value: w }));
    } else {
        rawItems = inputs;
    }

    return rawItems.map(item => {
        if (item.type === 'image') {
            return {
                type: 'image',
                value: item.value,
                orpIndex: 0,
                delayMultiplier: 4.0, // Long pause for images
                cfi: item.cfi
            } as Token;
        }

        const clean = item.value.trim();
        if (!clean) return null;

        // "Noise" filtering logic (skip metadata/page numbers)
        // Long patterns (Copyright/ISBN) apply at any length; short patterns
        // (roman numerals, page footers) only apply to short snippets to
        // avoid collateral damage on real sentences.
        if (LONG_NOISE_PATTERNS.some(pattern => pattern.test(clean))) return null;
        if (clean.length < 30) {
            const isNoise = SHORT_NOISE_PATTERNS.some(pattern => pattern.test(clean));
            if (isNoise) return null;
        }

        let multiplier = 1.0;
        if (/[.!?]["']?$/.test(clean)) multiplier = 2.0; // End of sentence
        else if (/[,;:]["']?$/.test(clean)) multiplier = 1.6; // Clause break
        else if (clean.length > 7) multiplier = 1.2; // Long words need slightly more time

        return {
            type: 'text',
            value: clean,
            orpIndex: calculateORP(clean),
            delayMultiplier: multiplier,
            cfi: item.cfi
        } as Token;
    }).filter((t): t is Token => t !== null);
};
