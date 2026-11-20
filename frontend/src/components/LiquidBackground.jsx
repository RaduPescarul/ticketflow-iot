import React, { useState, useEffect } from 'react';

const LiquidBackground = ({ darkMode = true }) => {
    const [videoReady, setVideoReady] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const panels = document.querySelectorAll('.saglix-glass, .clean-glass-card, .apple-pill');
            panels.forEach((panel) => {
                const rect = panel.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                panel.style.setProperty('--mouse-x', `${x}px`);
                panel.style.setProperty('--mouse-y', `${y}px`);
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleIframeLoad = () => {
        setTimeout(() => setVideoReady(true), 1600);
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mono-liquid-stage">
            {/* Instant CSS Liquid Waves while YouTube initializes */}
            <div className="mono-wave wave-1" />
            <div className="mono-wave wave-2" />
            <div className="mono-wave wave-3" />

            {/* YouTube Stream (Fades in after playback begins—no pause icon) */}
            <div
                className={`absolute inset-0 transition-opacity duration-1000 ${
                    videoReady ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div
                    className={`absolute inset-0 transition-all duration-500 ${
                        darkMode
                            ? 'opacity-85 grayscale contrast-125'
                            : 'opacity-75 grayscale invert contrast-135 brightness-105'
                    }`}
                >
                    <iframe
                        onLoad={handleIframeLoad}
                        title="Monochromatic Liquid Background"
                        src="https://www.youtube.com/embed/m1iTy0zJ8dU?autoplay=1&mute=1&loop=1&playlist=m1iTy0zJ8dU&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&disablekb=1"
                        allow="autoplay; encrypted-media"
                        className="w-[195vh] min-w-[115%] h-[62vw] min-h-[115%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none border-0"
                    />
                </div>
            </div>

            {/* Subtle Edge Vignette */}
            <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                    background: darkMode
                        ? 'radial-gradient(circle at 50% 45%, rgba(5,5,7,0.08) 0%, rgba(5,5,7,0.68) 100%)'
                        : 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.04) 0%, rgba(148,163,184,0.38) 100%)',
                }}
            />
        </div>
    );
};

export default LiquidBackground;