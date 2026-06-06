import { useState, useEffect, useCallback } from "react";
import { fetchAirtableRecords } from "../lib/airtable";
import { AIRTABLE_TABLES } from "../lib/airtableTables";
import {
  mapAbcPlan,
  mapAccessUser,
  mapEmotionSignal,
  mapLearningRecord,
  mapMedia,
  mapMelodyPattern,
  mapResource,
  mapScientificItem,
  mapSpecialist,
} from "../lib/airtableMappers";

/** All 9 non-student hub sections wired to Airtable (15/15 live platform). */
export const AIRTABLE_SECTION_CONFIG = {
  scientificItems: {
    tableId: AIRTABLE_TABLES.scientificItems,
    mapRecord: mapScientificItem,
    label: "مكتبة البنود / Scientific Items",
  },
  specialists: {
    tableId: AIRTABLE_TABLES.specialists,
    mapRecord: mapSpecialist,
    label: "الأخصائيين / Specialists",
  },
  abcData: {
    tableId: AIRTABLE_TABLES.abcData,
    mapRecord: mapAbcPlan,
    label: "تعديل السلوك ABC / Behavior Mod",
  },
  safeMedia: {
    tableId: AIRTABLE_TABLES.safeMedia,
    mapRecord: mapMedia,
    label: "الوسائط الآمنة / Safe Media",
  },
  melodyLab: {
    tableId: AIRTABLE_TABLES.melodyLab,
    mapRecord: mapMelodyPattern,
    label: "مختبر الألحان / Melody Lab",
  },
  communityResources: {
    tableId: AIRTABLE_TABLES.communityResources,
    mapRecord: mapResource,
    label: "موارد المجتمع / Resources",
  },
  accessControl: {
    tableId: AIRTABLE_TABLES.accessControl,
    mapRecord: mapAccessUser,
    label: "صلاحيات الوصول / Access Control",
  },
  learningDifficulties: {
    tableId: AIRTABLE_TABLES.learningDifficulties,
    mapRecord: mapLearningRecord,
    label: "صعوبات التعلم / Learning Center",
  },
  emotionalMonitoring: {
    tableId: AIRTABLE_TABLES.emotionalMonitoring,
    mapRecord: mapEmotionSignal,
    label: "كاميرا الرصد العاطفي / Emotional Monitoring",
  },
};

/**
 * Load a named hub section (one of the 9 Airtable-backed tables).
 * @param {keyof typeof AIRTABLE_SECTION_CONFIG} sectionKey
 */
export function useAirtableSection(sectionKey, options = {}) {
  const config = AIRTABLE_SECTION_CONFIG[sectionKey];
  if (!config) {
    throw new Error(`Unknown Airtable section: ${sectionKey}`);
  }
  return useAirtableData(config.tableId, {
    mapRecord: config.mapRecord,
    ...options,
  });
}

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
