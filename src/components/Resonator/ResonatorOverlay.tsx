import { useEffect, useState, useRef } from 'react';
import { useReaderStore } from '../../store/useReaderStore';
import { AnimatePresence, motion } from 'framer-motion';

export const ResonatorOverlay = () => {
    const {
        isResonating,
        setIsResonating,
        chapterTokens,
        wordIndex,
        setWordIndex,
        wpm,
        themeColor,
        themeBackground,
        triggerNextPage,
        fontSize,
        fontFamily,
        accelerationDuration,
        resonanceDirection
    } = useReaderStore();

    const [currentToken, setCurrentToken] = useState(chapterTokens[wordIndex]);
    const sessionStartTimeRef = useRef<number | null>(null);

    // Reset start time when resonance starts
    useEffect(() => {
        if (isResonating) {
            sessionStartTimeRef.current = Date.now();
        } else {
            sessionStartTimeRef.current = null;
        }
    }, [isResonating]);

    // Main Loop
    useEffect(() => {
        if (!isResonating) return;

        // Handle Auto-Advance / Stop
        if (chapterTokens.length === 0) {
            triggerNextPage();
            return;
        }

        // Directional Boundary Checks
        if (resonanceDirection === 'forward') {
            if (wordIndex >= chapterTokens.length) {
                triggerNextPage();
                return;
            }
        } else {
            // Backward
            if (wordIndex < 0) {
                // We hit the start. Stop.  (Could trigger PrevPage in future)
                setIsResonating(false);
                setWordIndex(0);
                return;
            }
        }

        const token = chapterTokens[wordIndex];
        // Guard for backwards OOB
        if (!token && resonanceDirection === 'backward') {
            // If we are at -1 or so
            setIsResonating(false);
            return;
        }
        if (!token) return;

        setCurrentToken(token);

        // Calculate current speed based on ramp-up
        let currentWpm = wpm;
        if (sessionStartTimeRef.current && accelerationDuration > 0) {
            const elapsed = (Date.now() - sessionStartTimeRef.current) / 1000;
            if (elapsed < accelerationDuration) {
                const progress = elapsed / accelerationDuration;
                // Start at 50% speed and ramp to 100%
                currentWpm = wpm * 0.5 + (wpm * 0.5 * progress);
            }
        }

        const baseDelay = 60000 / currentWpm;
        const finalDelay = baseDelay * token.delayMultiplier;

        const timer = setTimeout(() => {
            if (resonanceDirection === 'forward') {
                setWordIndex(wordIndex + 1);
            } else {
                setWordIndex(wordIndex - 1);
            }
        }, finalDelay);

        return () => clearTimeout(timer);
    }, [isResonating, wordIndex, chapterTokens, wpm, setWordIndex, triggerNextPage, accelerationDuration, resonanceDirection, setIsResonating]);

    // Handle Closing
    if (!isResonating) return null;

    if (!currentToken && chapterTokens.length > 0) return null;
    // If we have no tokens but are resonating, we are "searching/loading" so we might want to show a spinner or nothing.
    if (chapterTokens.length === 0) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: themeBackground, color: themeColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
                Searching for text...
            </div>
        );
    }

    const overlayStyle = {
        position: 'fixed' as const,
        top: 0, left: 0, right: 0, bottom: 0,
        background: themeBackground, // Use exact theme color
        opacity: 0.98, // Slight transparency
        color: themeColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        flexDirection: 'column' as const,
        cursor: 'pointer'
    };

    if (currentToken.type === 'image') {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={overlayStyle}
                    onMouseUp={() => {
                        console.log('[ResonatorOverlay] Mouse Up - Stopping Resonance');
                        setIsResonating(false);
                    }}
                    onTouchEnd={() => {
                        console.log('[ResonatorOverlay] Touch End - Stopping Resonance');
                        setIsResonating(false);
                    }}
                >
                    <img src={currentToken.value} alt="Visual content" style={{ maxWidth: '90%', maxHeight: '60vh', objectFit: 'contain' }} />
                    <div style={{ marginTop: '20px', fontSize: '1rem', color: themeColor, opacity: 0.7 }}>
                        Image • {wordIndex} / {chapterTokens.length}
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // TEXT RENDERING
    const word = currentToken.value;
    const leftPart = word.slice(0, currentToken.orpIndex);
    const orpChar = word[currentToken.orpIndex];
    const rightPart = word.slice(currentToken.orpIndex + 1);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ ...overlayStyle, flexDirection: 'row' }} // Text needs row layout
                onMouseUp={() => {
                    console.log('[ResonatorOverlay] Mouse Up - Stopping Resonance');
                    setIsResonating(false);
                }}
                onTouchEnd={() => {
                    console.log('[ResonatorOverlay] Touch End - Stopping Resonance');
                    setIsResonating(false);
                }}
            >
                <div style={{ 
                    fontSize: `${fontSize}rem`, 
                    fontFamily: fontFamily, 
                    display: 'flex', 
                    alignItems: 'baseline',
                    width: '100%',
                    justifyContent: 'center',
                    whiteSpace: 'pre'
                }}>
                    <div style={{ textAlign: 'right', flex: 1, overflow: 'hidden' }}>{leftPart}</div>
                    <div style={{ color: '#e00', fontWeight: 'bold', minWidth: '0.5ch', textAlign: 'center' }}>{orpChar}</div>
                    <div style={{ textAlign: 'left', flex: 1, overflow: 'hidden' }}>{rightPart}</div>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: 'calc(20px + env(safe-area-inset-bottom))',
                    fontSize: '1rem',
                    color: themeColor,
                    opacity: 0.7,
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none'
                }}>
                    {wordIndex} / {chapterTokens.length} • {wpm} WPM
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
