import { useEffect, useRef, useState } from "react";
import { playTypewriterEffect } from "../lib/sovereignAudio";
import { GAZE_HOLD_MS } from "../lib/sovereignProtocol";

const COPY = {
  ar: {
    alert: "تنبيه حياد النظرة",
    body: ">> رصد انخفاض في التتبع البصري... يُنصح بنشاط جذب انتباه فوري قبل استكمال المهمة الأكاديمية.",
  },
  en: {
    alert: "Gaze Neutrality Alert",
    body: ">> Visual tracking drop detected... immediate attention-capture activity recommended before resuming the academic task.",
  },
};

const GAZE_DIM_CLASS = "lux-gaze-dim";

function setGazeDim(on) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(GAZE_DIM_CLASS, Boolean(on));
}

/**
 * Gaze Neutrality observer — 5s hold + typewriter + ambient dim when triggered.
 */
export function useGazeNeutralityObserver({ active, triggerCondition, lang = "ar", disableDim = false }) {
  const copy = COPY[lang] ?? COPY.ar;
  const [visible, setVisible] = useState(false);
  const [typedAlert, setTypedAlert] = useState("");
  const armedRef = useRef(false);

  const shouldArm = Boolean(active) && Boolean(triggerCondition);

  useEffect(() => {
    if (!shouldArm) {
      armedRef.current = false;
      setVisible(false);
      setTypedAlert("");
      if (!disableDim) setGazeDim(false);
      return undefined;
    }

    if (armedRef.current) return undefined;

    const holdTimer = setTimeout(() => {
      if (armedRef.current) return;
      armedRef.current = true;
      setVisible(true);
      if (!disableDim) setGazeDim(true);
      playTypewriterEffect(Math.min(copy.body.length, 24));
      setTypedAlert("");
      let i = 0;
      const typer = setInterval(() => {
        i += 1;
        setTypedAlert(copy.body.slice(0, i));
        if (i >= copy.body.length) clearInterval(typer);
      }, 38);
    }, GAZE_HOLD_MS);

    return () => clearTimeout(holdTimer);
  }, [shouldArm, copy.body, disableDim]);

  useEffect(() => () => {
    if (!disableDim) setGazeDim(false);
  }, [disableDim]);

  return { visible, typedAlert, alertTitle: copy.alert };
}
