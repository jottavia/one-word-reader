import { describe, it, expect } from 'vitest';
import { processText, calculateORP } from '../services/textProcessor';

describe('Text Processor', () => {
    describe('calculateORP', () => {
        it('should find optimal recognition point for standard words', () => {
            expect(calculateORP('the')).toBe(1); // len=3, <=5 -> 1
            expect(calculateORP('reading')).toBe(2); // len=7, <=9 -> 2
            expect(calculateORP('comprehension')).toBe(3); // len=13, <=13 -> 3
        });

        it('should handle short words', () => {
            expect(calculateORP('a')).toBe(0); // len=1 -> 0
            expect(calculateORP('to')).toBe(1); // len=2, <=5 -> 1
        });
    });

    describe('processText', () => {
        it('should tokenize simple sentences', () => {
            const tokens = processText('Hello world.');
            expect(tokens).toHaveLength(2);
            expect(tokens[0].value).toBe('Hello');
            expect(tokens[1].value).toBe('world.');
        });

        it('should assign delay multipliers for punctuation', () => {
            const tokens = processText('Hello world.');
            expect(tokens[0].delayMultiplier).toBe(1);
            expect(tokens[1].delayMultiplier).toBeGreaterThan(1); // Period should delay
        });

        it('should keep the pronoun I (not roman-numeral noise)', () => {
            const tokens = processText('I think therefore I am');
            expect(tokens.map(t => t.value)).toEqual(['I', 'think', 'therefore', 'I', 'am']);
        });

        it('should keep pure numbers as content', () => {
            const tokens = processText('In 2026 we read');
            expect(tokens.map(t => t.value)).toContain('2026');
        });

        it('should filter the copyright token itself', () => {
            const tokens = processText('Copyright 2026 by Someone');
            expect(tokens.map(t => t.value)).not.toContain('Copyright');
            // Remaining words are kept — filtering is per-token by design.
            expect(tokens.map(t => t.value)).toContain('2026');
        });
    });
});
