import { useEffect, useState } from 'react';

// Phone: compact drawer menu. Tablet (portrait phones landscape, iPads,
// small laptops): condensed wrapping bar. Desktop: full control bar.
export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1100;

export interface Breakpoints {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

export const getBreakpoints = (width: number): Breakpoints => ({
    isMobile: width < MOBILE_BREAKPOINT,
    isTablet: width >= MOBILE_BREAKPOINT && width <= TABLET_BREAKPOINT,
    isDesktop: width > TABLET_BREAKPOINT,
});

const currentWidth = (): number =>
    typeof window === 'undefined' ? TABLET_BREAKPOINT + 1 : window.innerWidth;

export const useBreakpoints = (): Breakpoints => {
    const [bp, setBp] = useState<Breakpoints>(() => getBreakpoints(currentWidth()));

    useEffect(() => {
        const onResize = () => setBp(getBreakpoints(window.innerWidth));
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return bp;
};
