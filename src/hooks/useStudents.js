import { useState, useEffect, useCallback } from "react";
import {
  fetchStudents as fetchStudentsFromAirtable,
  getStudentAssignedClass,
  STUDENT_NAME_FIELD,
  STUDENT_CLASS_FIELD,
  STUDENTS_TABLE_LABEL,
} from "../lib/airtable";

export { STUDENT_NAME_FIELD, STUDENT_CLASS_FIELD, STUDENTS_TABLE_LABEL };

export function useStudents(lang = "ar") {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rows = await fetchStudentsFromAirtable();
      const list = Array.isArray(rows) ? rows : [];

      setStudents(
        list.map((row) => {
          const fields = row?.fields ?? {};
          const name =
            lang === "en"
              ? fields["Student Name"] ||
                fields["Name"] ||
                fields["Student Name EN"] ||
                row?.name
              : row?.name ?? fields["اسم الطالب A"] ?? fields["اسم الطالب"];
          const diagnosis =
            lang === "en"
              ? fields["Diagnosis EN"] || fields["Diagnosis"] || row?.diagnosis
              : row?.diagnosis ?? fields["التشخيص"];
          const assignedClass =
            row?.assignedClass ??
            getStudentAssignedClass(fields, lang) ??
            (lang === "en"
              ? fields["Assigned Class"] || fields["Class"] || fields["Classroom"]
              : fields[STUDENT_CLASS_FIELD] || fields["الفصل"]);

          return {
            id: row?.id ?? String(Math.random()),
            name: name ?? null,
            studentCode: row?.studentCode ?? null,
            diagnosis: diagnosis ?? null,
            assignedClass: assignedClass ?? null,
            harmonyScore: row?.harmonyScore ?? null,
            fields,
          };
        })
      );
    } catch (err) {
      console.error("[useStudents]", err);
      setError(
        err?.message ??
          (lang === "en" ? "Failed to load students" : "فشل تحميل الطلاب")
      );
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
