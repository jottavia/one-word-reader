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

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            background: themeBackground === '#111111' || themeBackground === '#0d0208' ? '#333' : '#fff', // Use a neutral container bg based on brightness 
            // Or better: just inverse of document to pop out? 
            // Let's stick to safe logic: if bg is dark, control is dark grey. else white.
            color: themeBackground === '#111111' || themeBackground === '#0d0208' ? '#fff' : '#333',
            padding: '5px 15px',
            borderRadius: '20px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            fontSize: '0.9rem'
        }}>
            {/* WPM Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>{wpm} WPM</span>
                <input
                    type="range"
                    min="200"
                    max="1000"
                    step="50"
                    value={wpm}
                    onChange={(e) => setWpm(Number(e.target.value))}
                    style={{ cursor: 'pointer', accentColor: 'currentColor' }}
                />
            </div>

            {/* Separator */}
            <div style={{ width: '1px', height: '20px', background: 'currentColor', opacity: 0.3 }} />

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

            {/* Separator */}
            <div style={{ width: '1px', height: '20px', background: 'currentColor', opacity: 0.3 }} />

            {/* Font Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
                <Type size={16} style={{ cursor: 'pointer' }} onClick={() => setShowFonts(!showFonts)} />

                {showFonts && (
                    <div style={{
                        position: 'absolute',
                        top: '120%', // Open downwards
                        left: '-50%',
                        background: themeBackground === '#ffffff' ? '#fff' : '#222',
                        border: '1px solid #777',
                        borderRadius: '8px',
                        padding: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        minWidth: '150px',
                        zIndex: 2000
                    }}>
                        {/* Font Family List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 'bold' }}>TYPEFACE</span>
                            {FONTS.map(f => (
                                <button
                                    key={f.name}
                                    onClick={() => { setFontFamily(f.value); setShowFonts(false); }}
                                    style={{
                                        textAlign: 'left',
                                        background: 'none',
                                        border: 'none',
                                        padding: '4px',
                                        cursor: 'pointer',
                                        color: 'inherit',
                                        fontFamily: f.value,
                                        display: 'flex', justifyContent: 'space-between'
                                    }}
                                >
                                    {f.name}
                                    {fontFamily === f.value && <Check size={14} />}
                                </button>
                            ))}
                        </div>

                        <div style={{ height: '1px', background: 'currentColor', opacity: 0.2 }} />

                        {/* Font Size Control inside popup */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 'bold' }}>SIZE ({fontSize})</span>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <button onClick={() => setFontSize(Math.max(2, fontSize - 0.5))} style={{ cursor: 'pointer', background: 'none', border: '1px solid currentColor', borderRadius: '4px', color: 'inherit', width: '30px' }}>-</button>
                                <button onClick={() => setFontSize(Math.min(10, fontSize + 0.5))} style={{ cursor: 'pointer', background: 'none', border: '1px solid currentColor', borderRadius: '4px', color: 'inherit', width: '30px' }}>+</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Separator */}
            <div style={{ width: '1px', height: '20px', background: 'currentColor', opacity: 0.3 }} />

            {/* Fullscreen */}
            <button onClick={handleFullscreen} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                <Maximize size={18} />
            </button>

            {/* Separator */}
            <div style={{ width: '1px', height: '20px', background: 'currentColor', opacity: 0.3 }} />

            {/* Theme Toggle */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowThemes(!showThemes)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <Palette size={18} />
                </button>

                {showThemes && (
                    <div style={{
                        position: 'absolute',
                        top: '120%', // Open downwards
                        right: 0,
                        background: themeBackground === '#ffffff' ? '#fff' : '#222', // Context menu bg
                        border: '1px solid #777',
                        borderRadius: '8px',
                        padding: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        minWidth: '120px'
                    }}>
                        {THEMES.map(t => (
                            <button
                                key={t.name}
                                onClick={() => {
                                    setTheme(t.color, t.bg);
                                    setShowThemes(false);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    background: t.bg,
                                    color: t.color,
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem'
                                }}
                            >
                                {t.name}
                                {themeColor === t.color && themeBackground === t.bg && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Separator */}
            <div style={{ width: '1px', height: '20px', background: 'currentColor', opacity: 0.3 }} />

            {/* Settings Menu */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    title="Settings"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}
                >
                    <Settings size={18} />
                </button>

                {showSettings && (
                    <div style={{
                        position: 'absolute',
                        top: '120%',
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
                        zIndex: 2000
                    }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, borderBottom: '1px solid #555', paddingBottom: '5px' }}>
                            <strong>Settings</strong>
                        </div>

                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                            Changes are saved automatically.
                        </div>

                        <button
                            onClick={() => {
                                if (window.confirm('Reset all settings to default?')) {
                                    resetSettings();
                                    setShowSettings(false);
                                }
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px',
                                background: '#d32f2f', color: 'white',
                                border: 'none', borderRadius: '4px',
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
