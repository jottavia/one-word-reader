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

export const useReaderStore = create<ReaderState>()(persist((set) => ({
    currentBookId: null,
    setCurrentBookId: (id) => set({ currentBookId: id }),
    isResonating: false,
    setIsResonating: (val) => set({ isResonating: val }),
    wpm: 300,
    setWpm: (wpm) => set({ wpm }),

    chapterTokens: [],
    setChapterTokens: (tokens) => set({ chapterTokens: tokens }),
    wordIndex: 0,
    setWordIndex: (index) => set({ wordIndex: index }),
    resonanceDirection: 'forward',
    setResonanceDirection: (dir) => set({ resonanceDirection: dir }),

    punctuationDelay: true,
    setPunctuationDelay: (val) => set({ punctuationDelay: val }),

    // Theme settings
    themeColor: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#eeeeee' : '#111111',
    themeBackground: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#111111' : '#ffffff',
    setTheme: (color, bg) => set({ themeColor: color, themeBackground: bg }),

    accelerationDuration: 3, // seconds
    setAccelerationDuration: (seconds) => set({ accelerationDuration: seconds }),

    // Reset
    resetSettings: () => set({
        wpm: 300,
        fontSize: 4,
        fontFamily: 'Mulish, sans-serif',
        themeColor: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#eeeeee' : '#111111',
        themeBackground: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#111111' : '#ffffff',
        accelerationDuration: 3,
        punctuationDelay: true
    }),

    // Auto-advance triggers
    nextPageTrigger: 0,
    triggerNextPage: () => set((state) => ({ nextPageTrigger: state.nextPageTrigger + 1 })),

    // Font settings
    fontSize: 4, // rem
    setFontSize: (size) => set({ fontSize: size }),
    fontFamily: 'Mulish, sans-serif',
    setFontFamily: (font) => set({ fontFamily: font }),
}), {
    name: 'reader-settings', // name of the item in the storage (must be unique)
    partialize: (state) => ({
        // Only persist these fields
        wpm: state.wpm,
        themeColor: state.themeColor,
        themeBackground: state.themeBackground,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        accelerationDuration: state.accelerationDuration,
        wordIndex: state.wordIndex,
        currentBookId: state.currentBookId,
        punctuationDelay: state.punctuationDelay
    })
}));
