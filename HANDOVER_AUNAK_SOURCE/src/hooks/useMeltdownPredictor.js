import { useEffect, useRef, useState, useCallback } from "react";
import { playWarningPulse } from "../lib/sovereignAudio";
import { MELTDOWN_LATENCY_MS } from "../lib/sovereignProtocol";
import { computeRiskScore, CRISIS_RISK_THRESHOLD } from "./useCrisisAlerts";

/**
 * Meltdown AI — flags rapid agitation bursts when inter-input latency ≤ 280ms.
 * Fuses with weighted ABC risk equation when burst threshold is met.
 */
export function useMeltdownPredictor({ active, lang = "ar", abc = {} } = {}) {
  const [meltdownRisk, setMeltdownRisk] = useState(false);
  const [burstCount, setBurstCount] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const lastEventRef = useRef(0);
  const streakRef = useRef(0);

  const intensity = meltdownRisk ? Math.max(Number(abc.intensity) || 1, 3) : Number(abc.intensity) || 1;
  const frequency = Number(abc.frequency) || 1;
  const duration = Number(abc.duration) || 1;

  const copy = {
    ar: { alert: "تنبيه Meltdown AI — عتبة 280ms", body: "رُصدت سلسلة استجابات سريعة؛ فعّل بروتوكول التهدئة." },
    en: { alert: "Meltdown AI — 280ms threshold", body: "Rapid response burst detected; activate de-escalation protocol." },
  }[lang] ?? { alert: "Meltdown AI", body: "" };

  const onPointerActivity = useCallback(
    (eventType) => {
      if (!active) return;
      const now = performance.now();
      const delta = lastEventRef.current ? now - lastEventRef.current : Infinity;
      lastEventRef.current = now;

      if (delta <= MELTDOWN_LATENCY_MS) {
        streakRef.current += 1;
        if (streakRef.current >= 3) {
          const I = Math.max(Number(abc.intensity) || 1, 3);
          const F = Number(abc.frequency) || 1;
          const D = Number(abc.duration) || 1;
          const risk = computeRiskScore(I, F, D);
          setRiskScore(risk);
          setMeltdownRisk(risk > CRISIS_RISK_THRESHOLD || streakRef.current >= 3);
          setBurstCount(streakRef.current);
          playWarningPulse();
        }
      } else {
        streakRef.current = 0;
        if (delta > MELTDOWN_LATENCY_MS * 4) {
          setMeltdownRisk(false);
          setRiskScore(0);
        }
      }
    },
    [active, abc.intensity, abc.frequency, abc.duration]
  );

  useEffect(() => {
    if (!active) {
      streakRef.current = 0;
      lastEventRef.current = 0;
      setMeltdownRisk(false);
      setBurstCount(0);
      setRiskScore(0);
      return undefined;
    }

    const onKey = () => onPointerActivity("keydown");
    const onClick = () => onPointerActivity("click");
    window.addEventListener("keydown", onKey, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [active, onPointerActivity]);

  const fusedCritical = meltdownRisk && riskScore > CRISIS_RISK_THRESHOLD;

  return {
    meltdownRisk,
    burstCount,
    riskScore,
    fusedCritical,
    alertTitle: copy.alert,
    alertBody: fusedCritical
      ? `${copy.body} — Risk: ${riskScore.toFixed(1)}`
      : copy.body,
  };
}
