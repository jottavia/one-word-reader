import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Token } from '../services/textProcessor';

interface ReaderState {
    currentBookId: string | null;
    setCurrentBookId: (id: string | null) => void;
    isResonating: boolean;
    setIsResonating: (val: boolean) => void;
    wpm: number;
    setWpm: (wpm: number) => void;

    // Speed Reader State
    chapterTokens: Token[];
    setChapterTokens: (tokens: Token[]) => void;
    wordIndex: number;
    setWordIndex: (index: number) => void;
    resonanceDirection: 'forward' | 'backward';
    setResonanceDirection: (dir: 'forward' | 'backward') => void;

    // Visual Settings
    themeColor: string;
    themeBackground: string;
    setTheme: (color: string, bg: string) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    fontFamily: string;
    setFontFamily: (font: string) => void;

    accelerationDuration: number;
    setAccelerationDuration: (seconds: number) => void;

    resetSettings: () => void;

    nextPageTrigger: number;
    triggerNextPage: () => void;

    punctuationDelay: boolean;
    setPunctuationDelay: (val: boolean) => void;
}

export const WPM_MIN = 50;
export const WPM_MAX = 2000;
export const WPM_DEFAULT = 300;
export const FONT_MIN = 2;
export const FONT_MAX = 10;
export const WARMUP_MIN = 0;
export const WARMUP_MAX = 10;

const clamp = (v: number, min: number, max: number, fallback: number): number => {
    if (typeof v !== 'number' || Number.isNaN(v)) return fallback;
    return Math.min(max, Math.max(min, v));
};

const prefersDark = (): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
        return false;
    }
};

const defaultTheme = () => ({
    themeColor: prefersDark() ? '#eeeeee' : '#111111',
    themeBackground: prefersDark() ? '#111111' : '#ffffff',
});

export const useReaderStore = create<ReaderState>()(persist((set) => ({
    currentBookId: null,
    // Switching books resets position; the per-book index is restored from storage.
    setCurrentBookId: (id) => set({ currentBookId: id, wordIndex: 0, chapterTokens: [], isResonating: false, resonanceDirection: 'forward' }),
    isResonating: false,
    setIsResonating: (val) => set({ isResonating: val }),
    wpm: WPM_DEFAULT,
    setWpm: (wpm) => set({ wpm: clamp(wpm, WPM_MIN, WPM_MAX, WPM_DEFAULT) }),

    chapterTokens: [],
    setChapterTokens: (tokens) => set((state) => ({
        chapterTokens: tokens,
        wordIndex: clamp(state.wordIndex, 0, Math.max(0, tokens.length - 1), 0),
    })),
    wordIndex: 0,
    setWordIndex: (index) => set((state) => ({
        wordIndex: clamp(Math.floor(index), 0, Math.max(0, state.chapterTokens.length - 1), 0),
    })),
    resonanceDirection: 'forward',
    setResonanceDirection: (dir) => set({ resonanceDirection: dir }),

    punctuationDelay: true,
    setPunctuationDelay: (val) => set({ punctuationDelay: val }),

    // Theme settings
    ...defaultTheme(),
    setTheme: (color, bg) => set({ themeColor: color, themeBackground: bg }),

    accelerationDuration: 3, // seconds
    setAccelerationDuration: (seconds) => set({ accelerationDuration: clamp(seconds, WARMUP_MIN, WARMUP_MAX, 3) }),

    // Reset
    resetSettings: () => set({
        wpm: WPM_DEFAULT,
        fontSize: 4,
        fontFamily: 'Mulish, sans-serif',
        ...defaultTheme(),
        accelerationDuration: 3,
        punctuationDelay: true,
        wordIndex: 0,
        isResonating: false,
        resonanceDirection: 'forward',
    }),

    // Auto-advance triggers
    nextPageTrigger: 0,
    triggerNextPage: () => set((state) => ({ nextPageTrigger: state.nextPageTrigger + 1 })),

    // Font settings
    fontSize: 4, // rem
    setFontSize: (size) => set({ fontSize: clamp(size, FONT_MIN, FONT_MAX, 4) }),
    fontFamily: 'Mulish, sans-serif',
    setFontFamily: (font) => set({ fontFamily: font }),
}), {
    name: 'reader-settings', // name of the item in the storage (must be unique)
    partialize: (state) => ({
        // Only persist these fields. Position is per-book in localforage;
        // the global wordIndex is intentionally NOT persisted to avoid
        // leaking one book's offset into another.
        wpm: state.wpm,
        themeColor: state.themeColor,
        themeBackground: state.themeBackground,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        accelerationDuration: state.accelerationDuration,
        currentBookId: state.currentBookId,
        punctuationDelay: state.punctuationDelay
    })
}));
