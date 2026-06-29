import { useEffect, useRef } from 'react';
import { playWarningPulse } from '../lib/sovereignAudio';

/** ABC risk equation: (I×2) + (F×1.5) + D */
export function computeRiskScore(intensity, frequency, duration) {
  return intensity * 2 + frequency * 1.5 + duration;
}

export const CRISIS_RISK_THRESHOLD = 15;
const REPEAT_MS = 25000;

export function useCrisisAlerts(intensity, frequency, duration) {
  const riskScore = computeRiskScore(intensity, frequency, duration);
  const isCritical = riskScore > CRISIS_RISK_THRESHOLD;
  const criticalRef = useRef(isCritical);

  useEffect(() => {
    criticalRef.current = isCritical;
    if (!isCritical) return undefined;
    playWarningPulse();
    const interval = setInterval(() => {
      if (criticalRef.current) playWarningPulse();
    }, REPEAT_MS);
    return () => clearInterval(interval);
  }, [isCritical]);

  return { riskScore, isCritical };
}
