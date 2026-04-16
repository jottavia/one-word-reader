import { useEffect, useRef, useCallback, useState } from 'react';
import { useReaderStore } from '../../store/useReaderStore';
import { loadBook, saveProgress, loadProgress, loadMetadata, type BookMetadata } from '../../services/storage';
import { BookParser } from '../../services/bookParser';
import { PdfParser } from '../../services/pdfParser';
import { processText, type Token } from '../../services/textProcessor';
import { ResonatorOverlay } from '../Resonator/ResonatorOverlay';
import { ReaderControls } from './ReaderControls';
import json from '../../../package.json';

const { version } = json;

export const ReaderView = () => {
    const {
        currentBookId,
        isResonating,
        setIsResonating,
        setChapterTokens,
        setResonanceDirection,
        themeColor,
        themeBackground
    } = useReaderStore();

    const [metadata, setMetadata] = useState<BookMetadata | null>(null);
    const [pdfPage, setPdfPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const viewerRef = useRef<HTMLDivElement>(null);
    const epubParserRef = useRef<BookParser | null>(null);
    const pdfParserRef = useRef<PdfParser | null>(null);
    const renditionRef = useRef<any>(null);

    // Refs for event handlers to avoid re-binding
    const wordIndexRef = useRef(0);
    const tokensRef = useRef<Token[]>([]);

    useEffect(() => {
        useReaderStore.subscribe(state => {
            wordIndexRef.current = state.wordIndex;
            tokensRef.current = state.chapterTokens;
        });
    }, []);

    // Theme synchronization
    useEffect(() => {
        if (renditionRef.current) {
            renditionRef.current.themes.register('custom', {
                body: { color: themeColor, background: themeBackground }
            });
            renditionRef.current.themes.select('custom');
        }
    }, [themeColor, themeBackground]);

    // Keyboard controls
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
            // Start reading forward
            useReaderStore.getState().setResonanceDirection('forward');
            setIsResonating(true);
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            // Right Arrow = Forward
            useReaderStore.getState().setResonanceDirection('forward');
            setIsResonating(true);
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            // Left Arrow = Backward
            useReaderStore.getState().setResonanceDirection('backward');
            setIsResonating(true);
        }
    }, [setIsResonating]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
            e.preventDefault();
            setIsResonating(false);
            // On release, highlight logic...

            const currentIndex = wordIndexRef.current;
            const currentToken = tokensRef.current[currentIndex];

            if (currentToken && currentToken.cfi && metadata?.type === 'epub') {
                // EPUB Highlight Logic
                if (renditionRef.current) {
                    renditionRef.current.display(currentToken.cfi);
                    renditionRef.current.annotations.add('highlight', currentToken.cfi, {}, null, 'hl-class');

                    // Ensure highlight style exists
                    renditionRef.current.themes.default({
                        '.hl-class': { 'fill': 'yellow', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply' }
                    });

                    setTimeout(() => {
                        renditionRef.current.annotations.remove(currentToken.cfi, 'highlight');
                    }, 2000);
                }
            } else if (metadata?.type === 'pdf') {
                // PDF Page Jump Logic
                // tokensRef has pseudo-CFIs like "pdf:0:5"
                if (currentToken && currentToken.cfi && currentToken.cfi.startsWith('pdf:')) {
                    const parts = currentToken.cfi.split(':');
                    const pageIndex = parseInt(parts[1]);
                    if (!isNaN(pageIndex)) setPdfPage(pageIndex);
                }
            }
        }
    }, [setIsResonating, metadata]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    // Load Metadata
    useEffect(() => {
        if (currentBookId) {
            loadMetadata(currentBookId).then(meta => {
                if (meta) setMetadata(meta);
                // If no metadata (legacy books), assume epub
                else setMetadata({ id: currentBookId, title: 'Unknown', type: 'epub', addedAt: 0 });
            });
        }
    }, [currentBookId]);

    // Book initialization
    useEffect(() => {
        if (!currentBookId || !viewerRef.current || !metadata) return;

        const initBook = async () => {
            const bookData = await loadBook(currentBookId);
            if (!bookData) return;

            if (metadata.type === 'pdf') {
                const parser = new PdfParser(bookData as ArrayBuffer);
                await parser.init();
                pdfParserRef.current = parser;
                setTotalPages(parser.pageCount);

                // Load Progress
                const savedCfi = await loadProgress(currentBookId);
                let startPage = 0;
                if (savedCfi && savedCfi.startsWith('pdf:')) {
                    startPage = parseInt(savedCfi.split(':')[1]) || 0;
                }
                setPdfPage(startPage);

                // Render will trigger via pdfPage effect
            } else {
                // EPUB
                const parser = new BookParser(bookData as ArrayBuffer);
                epubParserRef.current = parser;

                const rendition = parser.book.renderTo(viewerRef.current!, {
                    width: '100%',
                    height: '100%',
                    flow: 'scrolled-doc'
                });
                renditionRef.current = rendition;

                // Register Themes
                rendition.themes.register('custom', {
                    body: { color: themeColor, background: themeBackground }
                });
                rendition.themes.select('custom');

                // Listen for chapter changes
                rendition.on('relocated', async (location: any) => {
                    const cfi = location.start.cfi;
                    if (currentBookId) saveProgress(currentBookId, cfi);

                    const index = location.start.index;

                    // Extract and tokenize text for the current chapter
                    const data = await parser.getChapterData(index);
                    const tokens = processText(data);
                    setChapterTokens(tokens);
                });

                // Restore progress
                const savedCfi = await loadProgress(currentBookId);
                if (savedCfi) {
                    await rendition.display(savedCfi);
                } else {
                    await rendition.display();
                }
            }
        };

        // Cleanup
        if (epubParserRef.current) epubParserRef.current.book.destroy();
        if (pdfParserRef.current) pdfParserRef.current.destroy();
        viewerRef.current.innerHTML = ''; // Clear container

        initBook();

        return () => {
            if (epubParserRef.current) epubParserRef.current.book.destroy();
            if (pdfParserRef.current) pdfParserRef.current.destroy();
        };
    }, [currentBookId, metadata]); // Re-run if ID or metadata changes

    // PDF Page Change Effect
    useEffect(() => {
        if (metadata?.type === 'pdf' && pdfParserRef.current && viewerRef.current) {
            const renderPdf = async () => {
                await pdfParserRef.current!.renderTo(viewerRef.current!, pdfPage);
                const tokens = await pdfParserRef.current!.getPageData(pdfPage);
                setChapterTokens(processText(tokens));

                // Save progress
                const cfi = `pdf:${pdfPage}:0`;
                saveProgress(currentBookId!, cfi);
            };
            renderPdf();
        }
    }, [pdfPage, metadata, currentBookId]);

    // Handle Auto-Advance Trigger
    useEffect(() => {
        const handleNextPage = async () => {
            // Logic to move to next page
            if (metadata?.type === 'pdf') {
                if (pdfPage < totalPages - 1) {
                    setPdfPage(p => p + 1);
                    // The pdfPage effect will handle loading tokens
                    // We need to reset wordIndex to 0. 
                    // IMPORTANT: setPdfPage effect runs async, so we might want to ensure we reset wordIndex
                    // in that effect or here. 
                    useReaderStore.getState().setWordIndex(0);
                } else {
                    // End of book
                    setIsResonating(false);
                }
            } else {
                // EPUB
                if (renditionRef.current) {
                    await renditionRef.current.next();
                    // Relocated event handles token loading
                    useReaderStore.getState().setWordIndex(0);
                }
            }
        };

        // We only run this if trigger > 0 to avoid initial run
        const unsub = useReaderStore.subscribe((state, prevState) => {
            if (state.nextPageTrigger > prevState.nextPageTrigger) {
                handleNextPage();
            }
        });
        return unsub;
    }, [metadata, pdfPage, totalPages, setIsResonating]);

    // Sync Meta Theme Color (for iOS status bar)
    useEffect(() => {
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            (meta as any).name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', themeBackground);
    }, [themeBackground]);

    return (
        <div
            onMouseDown={(e) => {
                if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
                console.log('[ReaderView] Mouse Down - Starting Resonance');
                setResonanceDirection('forward');
                setIsResonating(true);
            }}
            onTouchStart={(e) => {
                if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
                console.log('[ReaderView] Touch Start - Starting Resonance');
                setResonanceDirection('forward');
                setIsResonating(true);
            }}
            onMouseUp={() => {
                console.log('[ReaderView] Mouse Up - Stopping Resonance');
                setIsResonating(false);
            }}
            onTouchEnd={() => {
                console.log('[ReaderView] Touch End - Stopping Resonance');
                setIsResonating(false);
            }}
            style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                background: themeBackground,
                color: themeColor,
                overflow: 'hidden',
                userSelect: 'none',
                WebkitUserSelect: 'none', // iOS Support
                WebkitTouchCallout: 'none', // iOS Support
                touchAction: 'none'
            }}>
            <ResonatorOverlay />

            <div style={{
                padding: 'calc(10px + env(safe-area-inset-top)) 20px 10px',
                background: themeBackground,
                borderBottom: `1px solid ${themeColor}22`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            color: themeColor,
                            border: `1px solid ${themeColor}`,
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Back to Library
                    </button>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 'bold' }}>v{version}</span>
                </div>

                <ReaderControls />
            </div>

            <div ref={viewerRef} style={{ flex: 1, overflow: 'hidden', overflowY: metadata?.type === 'pdf' ? 'auto' : 'hidden' }} />

            {/* Thumb Zone / Deadman Switch Indicator */}
            {!isResonating && (
                <div style={{
                    position: 'absolute',
                    bottom: 'calc(40px + env(safe-area-inset-bottom))',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    pointerEvents: 'none',
                    zIndex: 5
                }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        border: `2px solid ${themeColor}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${themeColor}11`,
                        animation: 'pulse 2s infinite ease-in-out'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: themeColor,
                            opacity: 0.2
                        }} />
                    </div>
                    <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.1rem',
                        opacity: 0.6,
                        textTransform: 'uppercase'
                    }}>
                        Hold to Read
                    </span>
                    <style>{`
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 0.5; }
                            50% { transform: scale(1.1); opacity: 0.8; }
                            100% { transform: scale(1); opacity: 0.5; }
                        }
                    `}</style>
                </div>
            )}

            {metadata?.type === 'pdf' && (
                <div style={{
                    position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                    background: themeBackground,
                    border: `1px solid ${themeColor}`,
                    color: themeColor,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    <button
                        onClick={() => setPdfPage(p => Math.max(0, p - 1))}
                        disabled={pdfPage <= 0}
                        style={{ cursor: 'pointer', padding: '4px 8px' }}
                    >
                        ←
                    </button>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                        Page {pdfPage + 1} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPdfPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={pdfPage >= totalPages - 1}
                        style={{ cursor: 'pointer', padding: '4px 8px' }}
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
};
