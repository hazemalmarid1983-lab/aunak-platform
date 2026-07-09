import { useEffect, useRef } from 'react';
import { playTypewriterEffect } from '../lib/sovereignAudio';
import { GAZE_HOLD_MS } from '../lib/sovereignProtocol';

/**
 * Tawasul child — idle gaze proxy (no biometric metrics): 5s without interaction → typewriter.
 */
export function useTawasulIdleGaze({ active, onTrigger, holdMs = GAZE_HOLD_MS }) {
  const lastActivityRef = useRef(Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      firedRef.current = false;
      return undefined;
    }

    const bump = () => {
      lastActivityRef.current = Date.now();
      firedRef.current = false;
    };

    window.addEventListener('pointerdown', bump);
    window.addEventListener('keydown', bump);
    window.addEventListener('touchstart', bump);

    const tick = setInterval(() => {
      if (firedRef.current) return;
      if (Date.now() - lastActivityRef.current >= holdMs) {
        firedRef.current = true;
        playTypewriterEffect(24);
        onTrigger?.();
      }
    }, 500);

    return () => {
      clearInterval(tick);
      window.removeEventListener('pointerdown', bump);
      window.removeEventListener('keydown', bump);
      window.removeEventListener('touchstart', bump);
    };
  }, [active, holdMs, onTrigger]);
}
