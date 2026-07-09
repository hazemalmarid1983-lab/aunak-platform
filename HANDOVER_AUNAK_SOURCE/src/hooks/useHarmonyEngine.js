import { useEffect, useState } from "react";
import { fetchStudents } from "../lib/airtable";
import { fetchAirtableRecords } from "../lib/airtable";
import { AIRTABLE_TABLES } from "../lib/airtableTables";
import { mapLearningRecord, mapAbcPlan } from "../lib/airtableMappers";
import { refreshStudentHarmony } from "../lib/harmonyEngine";
import { useAuth } from "../lib/auth";

/** Recompute harmony when active student session loads. */
export function useHarmonyEngine() {
  const { user, patchSession } = useAuth();
  const [harmony, setHarmony] = useState(user?.harmonyScore ?? null);
  const studentId = user?.activeStudentId ?? user?.childId ?? null;

  useEffect(() => {
    if (!studentId || !user?.biometricSovereign) return undefined;
    let cancelled = false;

    const fetchLearningForStudent = async (sid) => {
      const records = await fetchAirtableRecords(AIRTABLE_TABLES.learningDifficulties);
      const mapped = records.map((r) => mapLearningRecord(r));
      return mapped.find((r) => r.studentLinkedId === sid) ?? mapped[0] ?? null;
    };

    const fetchAbcForStudent = async () => {
      const records = await fetchAirtableRecords(AIRTABLE_TABLES.abcData);
      const mapped = records.map((r) => mapAbcPlan(r));
      return mapped[0] ?? null;
    };

    refreshStudentHarmony(studentId, { fetchLearningForStudent, fetchAbcForStudent })
      .then((result) => {
        if (cancelled || result?.score == null) return;
        setHarmony(result.score);
        patchSession({ harmonyScore: result.score });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [studentId, user?.biometricSovereign, patchSession]);

  return { harmonyScore: harmony ?? user?.harmonyScore ?? null };
}

export async function loadStudentById(studentId) {
  const rows = await fetchStudents();
  return (Array.isArray(rows) ? rows : []).find((s) => s.id === studentId) ?? null;
}
