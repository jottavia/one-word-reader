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
    });
});
