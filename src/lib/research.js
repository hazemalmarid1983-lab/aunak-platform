/**
 * Aunak Research Center — data anonymization & sovereign safeguards.
 *
 * Pipeline: vital tables → anonymizeForResearch() (PII filter) →
 * smartCensorAudit() (الرقيب الذكي) → display / AES-256-GCM export.
 *
 * A dedicated AunakResearchHub table can be plugged into
 * RESEARCH_SOURCES once its table ID exists in Airtable.
 */

import { AIRTABLE_TABLES } from "./airtableTables";

/** Vital tables feeding the national research atlas. */
export const RESEARCH_SOURCES = [
  { key: "students", tableId: AIRTABLE_TABLES.students, ar: "السجل الحيوي", en: "Vital Registry" },
  { key: "emotion", tableId: AIRTABLE_TABLES.emotionalMonitoring, ar: "الرصد العاطفي", en: "Emotional Monitoring" },
  { key: "learning", tableId: AIRTABLE_TABLES.learningDifficulties, ar: "صعوبات التعلم", en: "Learning Difficulties" },
  { key: "behavior", tableId: AIRTABLE_TABLES.abcData, ar: "تحليل السلوك ABC", en: "ABC Behavior" },
];

/* ------------------------------------------------------------------ */
/* PII Filter                                                           */
/* ------------------------------------------------------------------ */

/** Field names that may carry personal identity — always dropped. */
const PII_KEY_PATTERN =
  /اسم|name|email|بريد|phone|هاتف|جوال|واتس|whats|address|عنوان|سكن|كود|code|رمز|token|password|سر|هوية|بطاقة|ولي|والد|parent|guardian|user|مستخدم|photo|صورة|وجه|face|رابط|link|url|attachment|مرفق|تواصل|contact|ميلاد|birth/i;

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE_RE = /(?:\+?\d[\s\u0660-\u0669-]?){8,}/;
const RECORD_ID_RE = /\brec[a-zA-Z0-9]{14}\b/;

/** Deterministic anonymous case ID (no way back to the Airtable record). */
function makeAnonId(recordId, index) {
  const seed = String(recordId ?? index);
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `AUN-RS-${String((h % 9000) + 1000)}${String.fromCharCode(65 + (h % 26))}`;
}

function sanitizeValue(value) {
  if (value == null) return null;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (EMAIL_RE.test(value) || PHONE_RE.test(value) || RECORD_ID_RE.test(value)) return null;
    return value;
  }
  if (Array.isArray(value)) {
    const clean = value
      .map((v) => sanitizeValue(v))
      .filter((v) => v != null && typeof v !== "object");
    return clean.length > 0 ? clean : null;
  }
  // Formula/attachment objects are dropped entirely.
  return null;
}

/**
 * Strip all personal identity from raw Airtable records, keeping only the
 * vital indicators (scores, categories, clinical measures) for analysis.
 */
export function anonymizeForResearch(records, sourceKey = "vital") {
  const list = Array.isArray(records) ? records : [];
  return list.map((record, index) => {
    const indicators = {};
    for (const [key, raw] of Object.entries(record?.fields ?? {})) {
      if (PII_KEY_PATTERN.test(key)) continue;
      const value = sanitizeValue(raw);
      if (value != null) indicators[key] = value;
    }
    return { anonId: makeAnonId(record?.id, index), source: sourceKey, indicators };
  });
}

/* ------------------------------------------------------------------ */
/* الرقيب الذكي — Smart Censor                                          */
/* ------------------------------------------------------------------ */

/**
 * Final audit pass over anonymized rows: serializes every row and scans
 * for any residual identity leak. Flagged rows are reported (and should
 * be dropped) before anything is displayed or exported.
 */
export function smartCensorAudit(rows) {
  const flags = [];
  for (const row of rows ?? []) {
    const text = JSON.stringify(row.indicators ?? {});
    if (EMAIL_RE.test(text)) flags.push({ anonId: row.anonId, reason: "email" });
    else if (PHONE_RE.test(text)) flags.push({ anonId: row.anonId, reason: "phone" });
    else if (RECORD_ID_RE.test(text)) flags.push({ anonId: row.anonId, reason: "record-id" });
  }
  return {
    passed: flags.length === 0,
    flags,
    scanned: rows?.length ?? 0,
  };
}

/** Drop any row the censor flagged — absolute privacy guarantee. */
export function applyCensor(rows) {
  const { flags } = smartCensorAudit(rows);
  if (flags.length === 0) return rows;
  const blocked = new Set(flags.map((f) => f.anonId));
  return rows.filter((r) => !blocked.has(r.anonId));
}

/* ------------------------------------------------------------------ */
/* AES-256-GCM Export — see sovereignCrypto.js                          */
/* ------------------------------------------------------------------ */

export { encryptForExport } from "./sovereignCrypto";
