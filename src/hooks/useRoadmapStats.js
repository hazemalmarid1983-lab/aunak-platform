import { useEffect, useMemo, useState } from "react";
import { fetchStudents } from "../lib/airtable";

/** Roadmap counts by student Status (New / Active / Other). */
export function useRoadmapStats({ enabled = true } = {}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setLoading(true);
    fetchStudents()
      .then((rows) => {
        if (!cancelled) setStudents(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setStudents([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const stats = useMemo(() => {
    const counts = { new: 0, active: 0, other: 0 };
    for (const s of students) {
      const raw = String(s?.status ?? s?.fields?.Status ?? "").trim().toLowerCase();
      if (raw === "new" || raw === "جديد") counts.new += 1;
      else if (raw === "active" || raw === "نشط") counts.active += 1;
      else counts.other += 1;
    }
    return counts;
  }, [students]);

  return { stats, loading, students };
}
