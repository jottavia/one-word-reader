import { describe, it, expect } from 'vitest';
import { getBreakpoints, MOBILE_BREAKPOINT, TABLET_BREAKPOINT } from './useBreakpoints';

describe('getBreakpoints', () => {
    it('classifies phones below 768px', () => {
        expect(getBreakpoints(360)).toEqual({ isMobile: true, isTablet: false, isDesktop: false });
        expect(getBreakpoints(MOBILE_BREAKPOINT - 1).isMobile).toBe(true);
    });

    it('classifies tablets from 768 to 1100px', () => {
        // iPad portrait (768) and landscape (1024/1180)
        expect(getBreakpoints(768)).toEqual({ isMobile: false, isTablet: true, isDesktop: false });
        expect(getBreakpoints(1024)).toEqual({ isMobile: false, isTablet: true, isDesktop: false });
        expect(getBreakpoints(TABLET_BREAKPOINT).isTablet).toBe(true);
    });

    it('classifies desktop above 1100px', () => {
        expect(getBreakpoints(TABLET_BREAKPOINT + 1)).toEqual({ isMobile: false, isTablet: false, isDesktop: true });
        expect(getBreakpoints(1440).isDesktop).toBe(true);
    });
});
