import { useEffect, useRef } from 'react';
import { LiquidGlass } from '@ybouane/liquidglass';

export function useLiquidGlass(deps = [], options = {}) {
    const rootRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        const root = rootRef.current;
        if (!root) return;

        const setup = async () => {
            if (instanceRef.current) {
                instanceRef.current.destroy();
                instanceRef.current = null;
            }

            const glassElements = root.querySelectorAll(':scope > .lg-surface');
            if (glassElements.length === 0) return;

            try {
                const instance = await LiquidGlass.init({
                    root,
                    glassElements,
                    defaults: {
                        cornerRadius: 28,
                        blurAmount: 0.22,
                        refraction: 0.72,
                        ...options,
                    },
                });

                if (!cancelled) {
                    instanceRef.current = instance;
                } else {
                    instance.destroy();
                }
            } catch (err) {
                console.warn('LiquidGlass fallback active:', err);
            }
        };

        const frame = requestAnimationFrame(setup);

        return () => {
            cancelled = true;
            cancelAnimationFrame(frame);
            if (instanceRef.current) {
                instanceRef.current.destroy();
                instanceRef.current = null;
            }
        };
    }, deps);

    return { rootRef, instanceRef };
}