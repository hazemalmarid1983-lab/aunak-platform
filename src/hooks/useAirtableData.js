import { useState, useEffect, useCallback } from "react";
import { fetchAirtableRecords } from "../lib/airtable";

/**
 * Generic hook: load any Airtable table by ID with loading/error states.
 * @param {string} tableId
 * @param {{ mapRecord?: (record) => object, enabled?: boolean }} options
 */
export function useAirtableData(tableId, options = {}) {
  const { mapRecord, enabled = true, lang = "ar" } = options;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled && tableId));
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!enabled || !tableId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const raw = await fetchAirtableRecords(tableId);
      const list = Array.isArray(raw) ? raw : [];
      const mapped = mapRecord
        ? list.map((r) => {
            try {
              return mapRecord(r, lang);
            } catch (e) {
              console.warn("[useAirtableData] mapRecord failed:", e);
              return { id: r?.id, fields: r?.fields ?? {} };
            }
          })
        : list.map((r) => ({ id: r.id, fields: r?.fields ?? {} }));
      setRecords(mapped.filter(Boolean));
    } catch (err) {
      console.error("[useAirtableData]", tableId, err);
      setError(
        err?.message ??
          (lang === "en" ? "Failed to load data from Airtable" : "فشل تحميل البيانات من Airtable")
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [tableId, enabled, mapRecord, lang]);

  useEffect(() => {
    load();
  }, [load]);

  return { records, loading, error, refetch: load, isEmpty: !loading && records.length === 0 };
}
