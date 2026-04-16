import { useReaderStore } from '../../store/useReaderStore';
import { Palette, Type, Maximize, Check, RotateCcw, Settings } from 'lucide-react';
import { useState } from 'react';

const THEMES = [
    { name: 'Light', color: '#111111', bg: '#ffffff' },
    { name: 'Dark', color: '#eeeeee', bg: '#111111' },
    { name: 'Sepia', color: '#5f4b32', bg: '#f6f1d1' },
    { name: 'Matrix', color: '#00ff41', bg: '#0d0208' },
];

const FONTS = [
    { name: 'Sans', value: 'Mulish, sans-serif' },
    { name: 'Serif', value: 'Merriweather, serif' },
    { name: 'Mono', value: 'monospace' },
    { name: 'Dyslexic', value: 'OpenDyslexic, sans-serif' },
];

import { useReaderStore } from '../../store/useReaderStore';
import { Palette, Type, Maximize, Check, RotateCcw, Settings, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const THEMES = [
    { name: 'Light', color: '#111111', bg: '#ffffff' },
    { name: 'Dark', color: '#eeeeee', bg: '#111111' },
    { name: 'Sepia', color: '#5f4b32', bg: '#f6f1d1' },
    { name: 'Matrix', color: '#00ff41', bg: '#0d0208' },
];

const FONTS = [
    { name: 'Sans', value: 'Mulish, sans-serif' },
    { name: 'Serif', value: 'Merriweather, serif' },
    { name: 'Mono', value: 'monospace' },
    { name: 'Dyslexic', value: 'OpenDyslexic, sans-serif' },
];

export const ReaderControls = () => {
    const {
        wpm, setWpm,
        fontSize, setFontSize,
        fontFamily, setFontFamily,
        themeColor, themeBackground, setTheme,
        accelerationDuration, setAccelerationDuration,
        resetSettings
    } = useReaderStore();

    const [showThemes, setShowThemes] = useState(false);
    const [showFonts, setShowFonts] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const containerStyle: React.CSSProperties = {
        background: themeBackground === '#111111' || themeBackground === '#0d0208' ? '#333' : '#fff',
        color: themeBackground === '#111111' || themeBackground === '#0d0208' ? '#fff' : '#333',
        padding: '5px 15px',
        borderRadius: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    };

    const ControlGroups = ({ isVertical = false }: { isVertical?: boolean }) => {
        const groupStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
            alignItems: isVertical ? 'flex-start' : 'center',
            gap: isVertical ? '20px' : '15px',
            width: isVertical ? '100%' : 'auto'
        };

        const separator = !isVertical && <div style={{ width: '1px', height: '20px', background: 'currentColor', opacity: 0.3 }} />;

        return (
            <div style={groupStyle}>
                {/* WPM Control */}
                <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row', alignItems: isVertical ? 'flex-start' : 'center', gap: '8px', width: isVertical ? '100%' : 'auto' }}>
                    <span style={{ fontWeight: 'bold' }}>{wpm} WPM</span>
                    <input
                        type="range"
                        min="200"
                        max="1000"
                        step="50"
                        value={wpm}
                        onChange={(e) => setWpm(Number(e.target.value))}
                        style={{ cursor: 'pointer', accentColor: 'currentColor', width: isVertical ? '100%' : '100px' }}
                    />
                </div>

                {separator}

                {/* Acceleration Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }} title="Ramp-up duration (seconds)">
                    <span>Warmup:</span>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        value={accelerationDuration}
                        onChange={(e) => setAccelerationDuration(Number(e.target.value))}
                        style={{
                            width: '40px',
                            background: 'transparent',
                            color: 'inherit',
                            border: '1px solid currentColor',
                            borderRadius: '4px',
                            padding: '2px',
                            textAlign: 'center'
                        }}
                    />
                    <span>s</span>
                </div>

                {separator}

                {/* Font Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Type size={16} style={{ cursor: 'pointer' }} onClick={() => setShowFonts(!showFonts)} />
                        {isVertical && <span onClick={() => setShowFonts(!showFonts)} style={{ cursor: 'pointer' }}>Typeface & Size</span>}
                    </div>

                    {showFonts && (
                        <div style={{
                            position: isVertical ? 'static' : 'absolute',
                            top: isVertical ? '0' : '120%',
                            left: isVertical ? '0' : '-50%',
                            background: themeBackground === '#ffffff' ? '#fff' : '#222',
                            border: '1px solid #777',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            minWidth: '200px',
                            zIndex: 4000
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 'bold' }}>TYPEFACE</span>
                                {FONTS.map(f => (
                                    <button
                                        key={f.name}
                                        onClick={() => { setFontFamily(f.value); setShowFonts(false); }}
                                        style={{
                                            textAlign: 'left', background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: 'inherit',
                                            fontFamily: f.value, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}
                                    >
                                        {f.name}
                                        {fontFamily === f.value && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                            <div style={{ height: '1px', background: 'currentColor', opacity: 0.2 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 'bold' }}>SIZE ({fontSize})</span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <button onClick={() => setFontSize(Math.max(2, fontSize - 0.5))} style={{ cursor: 'pointer', background: 'none', border: '1px solid currentColor', borderRadius: '4px', color: 'inherit', padding: '5px 15px' }}>-</button>
                                    <button onClick={() => setFontSize(Math.min(10, fontSize + 0.5))} style={{ cursor: 'pointer', background: 'none', border: '1px solid currentColor', borderRadius: '4px', color: 'inherit', padding: '5px 15px' }}>+</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {separator}

                {/* Fullscreen - only on large screens usually but kept here */}
                {!isVertical && (
                    <button onClick={handleFullscreen} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                        <Maximize size={18} />
                    </button>
                )}

                {separator}

                {/* Theme Toggle */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowThemes(!showThemes)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <Palette size={18} />
                        {isVertical && <span>Themes</span>}
                    </button>

                    {showThemes && (
                        <div style={{
                            position: isVertical ? 'static' : 'absolute',
                            top: isVertical ? '0' : '120%',
                            right: 0,
                            background: themeBackground === '#ffffff' ? '#fff' : '#222',
                            border: '1px solid #777',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            minWidth: isVertical ? '100%' : '150px',
                            zIndex: 4000
                        }}>
                            {THEMES.map(t => (
                                <button
                                    key={t.name}
                                    onClick={() => { setTheme(t.color, t.bg); setShowThemes(false); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px',
                                        border: '1px solid #ccc', borderRadius: '4px', background: t.bg,
                                        color: t.color, cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem'
                                    }}
                                >
                                    {t.name}
                                    {themeColor === t.color && themeBackground === t.bg && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {separator}

                {/* Settings/Reset Menu */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <Settings size={18} />
                        {isVertical && <span>Settings</span>}
                    </button>

                    {showSettings && (
                        <div style={{
                            position: isVertical ? 'static' : 'absolute',
                            top: isVertical ? '0' : '120%',
                            right: 0,
                            background: themeBackground === '#ffffff' ? '#fff' : '#222',
                            border: '1px solid #777',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            minWidth: '200px',
                            zIndex: 4000
                        }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, borderBottom: '1px solid #555', paddingBottom: '5px' }}>
                                <strong>System Settings</strong>
                            </div>
                            <button
                                onClick={() => {
                                    if (window.confirm('Reset all settings to default?')) {
                                        resetSettings();
                                        setShowSettings(false);
                                    }
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
                                    background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px',
                                    cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem'
                                }}
                            >
                                <RotateCcw size={14} /> Reset Defaults
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <>
                <button
                    onClick={() => setIsMenuOpen(true)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: themeColor,
                        padding: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <Menu size={24} />
                </button>

                {isMenuOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0, right: 0, bottom: 0, left: 0,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 3000,
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }} onClick={() => setIsMenuOpen(false)}>
                        <div style={{
                            width: '85%',
                            maxWidth: '320px',
                            height: '100%',
                            background: themeBackground,
                            color: themeColor,
                            padding: 'calc(20px + env(safe-area-inset-top)) 20px 20px 20px',
                            boxSizing: 'border-box',
                            boxShadow: '-5px 0 25px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '30px',
                            overflowY: 'auto'
                        }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Reader Settings</h2>
                                <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'inherit' }}>
                                    <X size={28} />
                                </button>
                            </div>

                            <ControlGroups isVertical />
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div style={containerStyle}>
            <ControlGroups />
        </div>
    );
};
