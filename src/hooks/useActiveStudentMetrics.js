import { useEffect, useState } from "react";
import { loadStudentById } from "../hooks/useHarmonyEngine";
import { detectGazeNeutralityCondition } from "../lib/sovereignProtocol";

/** Active student row + gaze trigger for neural observers. */
export function useActiveStudentMetrics(user) {
  const studentId = user?.activeStudentId ?? user?.childId ?? null;
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (!studentId) {
      setStudent(null);
      return undefined;
    }
    let cancelled = false;
    loadStudentById(studentId)
      .then((row) => {
        if (!cancelled) setStudent(row);
      })
      .catch(() => {
        if (!cancelled) setStudent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const gazeTrigger = detectGazeNeutralityCondition(student);

  const abcDefaults = {
    intensity: Number(student?.behaviorIntensity) || 1,
    frequency: 1,
    duration: 1,
  };

  return { student, gazeTrigger, abcDefaults };
}
