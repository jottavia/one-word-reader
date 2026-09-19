import { describe, it, expect, beforeEach } from 'vitest';
import { useReaderStore, WPM_MIN, WPM_MAX } from '../store/useReaderStore';

beforeEach(() => {
    useReaderStore.setState({ chapterTokens: [], wordIndex: 0 });
});

describe('useReaderStore clamping', () => {
    it('clamps wpm into range and falls back on NaN', () => {
        const { setWpm } = useReaderStore.getState();
        setWpm(-100);
        expect(useReaderStore.getState().wpm).toBe(WPM_MIN);
        setWpm(99999);
        expect(useReaderStore.getState().wpm).toBe(WPM_MAX);
        setWpm(Number.NaN);
        expect(useReaderStore.getState().wpm).toBe(300);
    });

    it('clamps font size and warmup duration', () => {
        const { setFontSize, setAccelerationDuration } = useReaderStore.getState();
        setFontSize(100);
        expect(useReaderStore.getState().fontSize).toBe(10);
        setFontSize(0);
        expect(useReaderStore.getState().fontSize).toBe(2);
        setAccelerationDuration(-5);
        expect(useReaderStore.getState().accelerationDuration).toBe(0);
        setAccelerationDuration(99);
        expect(useReaderStore.getState().accelerationDuration).toBe(10);
    });

    it('clamps wordIndex to token bounds', () => {
        const store = useReaderStore.getState();
        store.setChapterTokens([
            { type: 'text', value: 'a', orpIndex: 0, delayMultiplier: 1 },
            { type: 'text', value: 'b', orpIndex: 0, delayMultiplier: 1 },
        ]);
        store.setWordIndex(99);
        expect(useReaderStore.getState().wordIndex).toBe(1);
        store.setWordIndex(-5);
        expect(useReaderStore.getState().wordIndex).toBe(0);
    });

    it('resetSettings clears position and stops resonance', () => {
        const store = useReaderStore.getState();
        store.setChapterTokens([
            { type: 'text', value: 'a', orpIndex: 0, delayMultiplier: 1 },
        ]);
        store.setWordIndex(0);
        useReaderStore.setState({ isResonating: true });
        store.resetSettings();
        const s = useReaderStore.getState();
        expect(s.wordIndex).toBe(0);
        expect(s.isResonating).toBe(false);
        expect(s.wpm).toBe(300);
    });
});
