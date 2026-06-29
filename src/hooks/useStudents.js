import { useState, useEffect, useCallback } from "react";
import { fetchStudents } from "../lib/airtable";
import { STUDENT as SF } from "../lib/airtableFields";

export const STUDENT_NAME_FIELD = SF.name;
export const STUDENT_CLASS_FIELD = SF.assigned_class;
export const STUDENTS_TABLE_LABEL = "Students";

export function useStudents(lang = "ar") {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchStudents();
      const list = Array.isArray(rows) ? rows : [];
      setStudents(
        list.map((row) => {
          const fields = row?.fields ?? {};
          const name =
            lang === "en"
              ? fields[SF.name] || row?.name
              : row?.name ?? fields[SF.name];
          const diagnosis =
            lang === "en" ? row?.diagnosis ?? fields[SF.diagnosis] : row?.diagnosis ?? fields[SF.diagnosis];
          const assignedClass =
            lang === "en"
              ? fields[SF.assigned_class] || row?.assignedClass
              : row?.assignedClass ?? fields[SF.assigned_class];
          return { ...row, name, diagnosis, assignedClass };
        })
      );
    } catch (e) {
      setError(e?.message ?? "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    load();
  }, [load]);

  return { students, loading, error, refetch: load };
}
