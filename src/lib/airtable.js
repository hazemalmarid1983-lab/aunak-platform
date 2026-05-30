/**
 * Airtable REST client — native fetch only (no npm "airtable" package).
 */

import { AIRTABLE_TABLES } from "./airtableTables";

export { AIRTABLE_TABLES };

export const AIRTABLE_BASE_ID =
  (import.meta.env.VITE_AIRTABLE_BASE_ID || "appaGfKj4vYhMw0cb").split("/")[0] ||
  "appaGfKj4vYhMw0cb";
export const STUDENTS_TABLE = AIRTABLE_TABLES.students;
export const STUDENT_NAME_FIELD = "اسم الطالب A";
export const STUDENT_CLASS_FIELD = "الفصل الدراسي";
export const STUDENTS_TABLE_LABEL = "جدول الطلاب";

/** Paste your Airtable Personal Access Token here (pat...). */
const HARDCODED_API_KEY = "put_your_token_here";

function resolveApiKey() {
  const fromEnv =
    import.meta.env.VITE_AIRTABLE_API_KEY ||
    import.meta.env.VITE_AIRTABLE_PAT;
  if (fromEnv && fromEnv !== "put_your_token_here") return fromEnv;
  return HARDCODED_API_KEY;
}

export const AIRTABLE_API_KEY = resolveApiKey();

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

export const airtable = {
  apiKey: AIRTABLE_API_KEY,
  baseId: AIRTABLE_BASE_ID,
  baseUrl: BASE_URL,
  studentsTableId: STUDENTS_TABLE,
};

function fieldValue(raw) {
  if (raw == null || raw === "") return null;
  if (Array.isArray(raw)) {
    return raw
      .map((v) => (typeof v === "object" && v !== null ? v.name ?? String(v) : String(v)))
      .join(", ");
  }
  if (typeof raw === "object") return raw.name ?? String(raw);
  return String(raw);
}

export function getField(fields, exactName, fallbackIncludes) {
  if (!fields || typeof fields !== "object") return null;
  if (exactName in fields) return fieldValue(fields[exactName]);
  const key = Object.keys(fields).find(
    (k) => k === exactName || k.includes(fallbackIncludes)
  );
  return key ? fieldValue(fields[key]) : null;
}

export function parseHarmonyScore(score) {
  if (score == null || score === "") return null;
  const n = Number(String(score).replace(/%/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function buildQueryString(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function airtableFetchTable(tableId, params = {}) {
  if (!AIRTABLE_API_KEY || AIRTABLE_API_KEY === "put_your_token_here") {
    throw new Error(
      "Airtable API key missing. Set HARDCODED_API_KEY in src/lib/airtable.js or VITE_AIRTABLE_API_KEY in .env.local"
    );
  }

  const url = `${BASE_URL}/${encodeURIComponent(tableId)}${buildQueryString(params)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json; charset=utf-8",
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Airtable Error ${response.status}${detail ? `: ${detail}` : ""}`);
  }

  return response.json();
}

export async function fetchAllRecords(tableId, params = {}) {
  const allRecords = [];
  let offset;

  do {
    const pageParams = { ...params };
    if (offset) pageParams.offset = offset;
    const page = await airtableFetchTable(tableId, pageParams);
    if (Array.isArray(page.records)) allRecords.push(...page.records);
    offset = page.offset;
  } while (offset);

  return allRecords;
}

/** Fetch all records from any table; tries Grid view then falls back. */
export async function fetchAirtableRecords(tableId, params = {}) {
  if (!tableId) return [];
  try {
    return await fetchAllRecords(tableId, { view: "Grid view", ...params });
  } catch (firstError) {
    console.warn(`[airtable] Grid view failed for ${tableId}:`, firstError.message);
    try {
      return await fetchAllRecords(tableId, params);
    } catch (secondError) {
      console.error(`[airtable] fetch failed for ${tableId}:`, secondError);
      throw secondError;
    }
  }
}

async function loadStudentRecords() {
  try {
    return await fetchAllRecords(STUDENTS_TABLE, { view: "Grid view" });
  } catch (firstError) {
    console.warn("[airtable] Grid view fetch failed, retrying without view:", firstError.message);
    return fetchAllRecords(STUDENTS_TABLE);
  }
}

export function getStudentAssignedClass(fields, lang = "ar") {
  if (!fields || typeof fields !== "object") return null;

  const keys =
    lang === "en"
      ? ["Assigned Class", "Class", "Classroom", "Class Name", STUDENT_CLASS_FIELD, "الفصل", "الفصل الدراسي"]
      : [STUDENT_CLASS_FIELD, "الفصل", "Assigned Class", "Class", "Classroom", "Class Name"];

  for (const key of keys) {
    const value = getField(fields, key, key.split(" ")[0]);
    if (value) return value;
  }

  const fallbackKey = Object.keys(fields).find((k) => {
    const lower = k.toLowerCase();
    return lower.includes("class") || k.includes("فصل");
  });

  return fallbackKey ? getField(fields, fallbackKey, fallbackKey) : null;
}

function mapRecord(record) {
  const fields = record?.fields ?? {};
  const harmonyRaw = getField(fields, "Harmony Score | درجة التناغم", "تناغم");

  return {
    id: record.id,
    name: getField(fields, STUDENT_NAME_FIELD, "اسم الطالب") || "اسم غير معروف",
    studentCode: getField(fields, "كود الطفل (ID)", "كود"),
    diagnosis: getField(fields, "التشخيص", "تشخيص"),
    assignedClass: getStudentAssignedClass(fields),
    harmonyScore: parseHarmonyScore(harmonyRaw) ?? harmonyRaw,
    fields,
  };
}

export async function fetchStudents() {
  const records = await loadStudentRecords();
  if (!Array.isArray(records)) return [];
  return records.map(mapRecord);
}
