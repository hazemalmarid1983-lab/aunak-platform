/**
 * Airtable REST client — native fetch only (no npm "airtable" package).
 */

import { AIRTABLE_TABLES } from "./airtableTables";
import { mapStudent } from "./airtableMappers";
import {
  STUDENT as SF,
  DAILY_SESSION as DS_FIELDS,
  ACCESS as AF,
  GOAL_ATTEMPT as GA_FIELDS,
  STUDENT_SELECT as SS,
} from "./airtableFields";

export { AIRTABLE_TABLES };
export { STUDENT, DAILY_SESSION, ACCESS, GOAL_ATTEMPT, SPECIALIST, SUMMER_ACADEMY } from "./airtableFields";

export const STUDENTS_TABLE = AIRTABLE_TABLES.students;

/** @deprecated use STUDENT.* from airtableFields */
export const STUDENT_NAME_FIELD = SF.name;
export const STUDENT_STATUS_FIELD = SF.status;
export const STUDENT_ID_FIELD = SF.id;
export const STUDENT_BIOMETRIC_FIELD = SF.face_biometric;
export const STUDENT_BIOMETRIC_STATUS_FIELD = SF.biometric_status;
export const STUDENT_HARMONY_FIELD = SF.harmony_score;
export const STUDENT_CAMERA_ACCESS_FIELD = SF.camera_access;
export const STUDENT_PARENT_PHONE_FIELD = SF.parent_phone;
export const PREFERRED_LANDING_FIELD = SF.preferred_destination;
export const STUDENT_AGE_FIELD = SF.age;
export const STUDENT_DIAGNOSIS_FIELD = SF.diagnosis;
export const STUDENT_CLASS_FIELD = SF.assigned_class;

export const STUDENTS_TABLE_LABEL = "Students";

export const DEFAULT_ENROLLMENT_STATUS = "active";
export const REFERENCE_CAPTURE_APPROVED_STATUS = "approved";

/** True when face descriptor missing or Biometric Capture Status is not approved. */
export function studentNeedsReferenceCapture(student) {
  const f = student?.fields ?? {};
  const rawDescriptor = student?.faceBiometric ?? getField(f, SF.face_biometric);
  const hasDescriptor =
    rawDescriptor != null &&
    rawDescriptor !== "" &&
    String(rawDescriptor).trim().length > 8;

  const captureStatus = getField(f, SF.biometric_status);
  if (!captureStatus || String(captureStatus).trim() === "") {
    return !hasDescriptor;
  }
  const approved = /approved|captured|active|complete|معتمد|ملتقط/i.test(
    String(captureStatus).trim()
  );
  return !hasDescriptor || !approved;
}

/** Unique student code: name + last 4 phone digits + YYYYMMDD → (ID) كود الطالب */
export function generateUniqueStudentCode({ name, parentPhone, date = new Date() } = {}) {
  const nameNorm = String(name ?? "student")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-_]/gu, "");
  const digits = String(parentPhone ?? "").replace(/\D/g, "");
  const last4 = (digits.slice(-4) || "0000").padStart(4, "0");
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${nameNorm || "student"}-${last4}-${y}${m}${d}`;
}

/** @deprecated use generateUniqueStudentCode */
export function generateStudentId(name, parentPhone) {
  return generateUniqueStudentCode({ name, parentPhone });
}

/** Logical enrollment payload → env-resolved Airtable column names for POST. */
export function buildStudentEnrollmentFields({
  name,
  age,
  presentingSymptoms,
  symptoms,
  status,
  parentPhone,
  parentCountryCode,
  preferredLanding,
  nationalId,
} = {}) {
  const fields = {};
  if (name?.trim()) fields[SF.name] = name.trim();
  if (nationalId?.trim()) fields[SF.national_id] = String(nationalId).trim().toUpperCase();
  if (age != null && age !== "" && Number.isFinite(Number(age))) {
    fields[SF.age] = Number(age);
  }
  const sx = String(presentingSymptoms ?? symptoms ?? "").trim();
  if (sx) fields[SF.presenting_symptoms] = sx;
  fields[SF.diagnosis] = "under_assessment";
  fields[SF.status] = status ?? SS.status.new;
  fields[SF.subscription_status] = SS.subscription_status.pending;
  if (parentCountryCode?.trim()) fields[SF.parent_country_code] = parentCountryCode.trim();
  if (parentPhone?.trim()) fields[SF.parent_phone] = parentPhone.trim();
  const code = generateUniqueStudentCode({ name, parentPhone });
  if (code) fields[SF.id] = code;
  if (preferredLanding?.trim()) fields[SF.preferred_destination] = preferredLanding.trim();
  else fields[SF.preferred_destination] = "live";
  return fields;
}

/** Central multi-center production base (Jul 2026). Legacy archive: appaGfKj4vYhMw0cb */
const DEFAULT_AIRTABLE_BASE_ID = "appcjitgWsbvIebwf";

/** Paste your Airtable Personal Access Token here (pat...) — dev-only; never shipped in prod bundle. */
const HARDCODED_API_KEY = "put_your_token_here";

/** P0: production always routes through /api/airtable — PAT never reaches the browser. */
export const USE_PROXY =
  import.meta.env.PROD || import.meta.env.VITE_USE_AIRTABLE_PROXY === "true";

function sanitizeAscii(value) {
  if (value == null) return "";
  return String(value)
    .replace(/^\uFEFF/, "")
    .replace(/\u200B/g, "")
    .replace(/[\r\n\t]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function sanitizeApiKey(key) {
  if (key == null || key === "") return key;
  return sanitizeAscii(key);
}

function sanitizeBaseId(raw) {
  const cleaned = sanitizeAscii(raw);
  if (!cleaned) return DEFAULT_AIRTABLE_BASE_ID;
  const segment = cleaned.split("/")[0].split("?")[0];
  const alnum = segment.replace(/[^a-zA-Z0-9]/g, "");
  return alnum || DEFAULT_AIRTABLE_BASE_ID;
}

function resolveBaseId() {
  const fromEnv = import.meta.env.VITE_AIRTABLE_BASE_ID;
  if (!fromEnv) return DEFAULT_AIRTABLE_BASE_ID;
  return sanitizeBaseId(fromEnv);
}

function resolveApiKey() {
  if (import.meta.env.PROD) return "";
  const fromEnv =
    import.meta.env.VITE_AIRTABLE_API_KEY ||
    import.meta.env.VITE_AIRTABLE_PAT;
  if (fromEnv && fromEnv !== "put_your_token_here") return sanitizeApiKey(fromEnv);
  return sanitizeApiKey(HARDCODED_API_KEY);
}

export const AIRTABLE_API_KEY = import.meta.env.PROD ? "" : resolveApiKey();
export const AIRTABLE_BASE_ID = resolveBaseId();

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

function hasDirectApiKey() {
  if (import.meta.env.PROD) return false;
  const key = resolveApiKey();
  return Boolean(key && key !== "put_your_token_here");
}

const SESSION_KEY = "aunak.session.v1";

function resolveProxyRoleHeader() {
  if (typeof sessionStorage === "undefined") return "";
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return "";
    const session = JSON.parse(raw);
    return String(session?.role ?? "").trim();
  } catch {
    return "";
  }
}

async function proxyFetch(tableId, { method = "GET", params = {}, recordId, body } = {}) {
  const qs = new URLSearchParams({ table: tableId });
  if (recordId) qs.set("recordId", recordId);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) qs.set(key, String(value));
  }
  const init = {
    method,
    headers: { Accept: sanitizeAscii("application/json") },
  };
  const role = resolveProxyRoleHeader();
  if (role) init.headers["X-Aunak-Role"] = sanitizeAscii(role);
  if (body != null && method !== "GET") {
    init.headers["Content-Type"] = sanitizeAscii("application/json");
    init.body = JSON.stringify(body);
  }
  assertLatin1Headers(init.headers);
  const response = await fetch("/api/airtable?" + qs.toString(), init);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("Airtable proxy " + response.status + (detail ? ": " + detail : ""));
  }
  return response.json();
}

async function directFetchTable(tableId, params = {}) {
  const url = BASE_URL + "/" + encodeURIComponent(tableId) + buildQueryString(params);
  const response = await fetch(url, {
    method: "GET",
    headers: airtableRequestHeaders(),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("Airtable Error " + response.status + (detail ? ": " + detail : ""));
  }
  return response.json();
}

async function directWrite(tableId, method, body, recordId) {
  const suffix = recordId ? "/" + encodeURIComponent(recordId) : "";
  const url = BASE_URL + "/" + encodeURIComponent(tableId) + suffix;
  const response = await fetch(url, {
    method,
    headers: airtableRequestHeaders({ write: true }),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("Airtable Error " + response.status + (detail ? ": " + detail : ""));
  }
  return response.json();
}

function assertLatin1Headers(headers) {
  for (const [name, value] of Object.entries(headers || {})) {
    const s = String(value);
    for (let i = 0; i < s.length; i++) {
      if (s.charCodeAt(i) > 255) {
        throw new Error(`Airtable request header "${name}" is not Latin-1 safe`);
      }
    }
  }
}

function airtableRequestHeaders({ write = false } = {}) {
  const token = sanitizeApiKey(AIRTABLE_API_KEY);
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: sanitizeAscii("application/json"),
  };
  if (write) headers["Content-Type"] = sanitizeAscii("application/json");
  assertLatin1Headers(headers);
  return headers;
}


export const airtable = {
  apiKey: import.meta.env.PROD ? "" : AIRTABLE_API_KEY,
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
  if (typeof raw === "object") {
    if ("value" in raw && raw.value != null && raw.value !== "") {
      return fieldValue(raw.value);
    }
    if ("state" in raw && (raw.state === "error" || raw.state === "empty")) {
      return null;
    }
    if (raw.name != null && raw.name !== "") return String(raw.name);
    return null;
  }
  return String(raw);
}

export function getField(fields, exactName, ...fallbackIncludes) {
  if (!fields || typeof fields !== "object") return null;
  if (exactName in fields) return fieldValue(fields[exactName]);

  const needles = [exactName, ...fallbackIncludes].filter(
    (n) => n != null && String(n).trim() !== ""
  );

  for (const needle of needles) {
    const key = Object.keys(fields).find(
      (k) =>
        k === needle ||
        (typeof needle === "string" && needle.length > 0 && k.includes(String(needle)))
    );
    if (key) return fieldValue(fields[key]);
  }

  return null;
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
  if (USE_PROXY) {
    return proxyFetch(tableId, { method: "GET", params });
  }
  if (!hasDirectApiKey()) {
    throw new Error(
      "Airtable API key missing. Set VITE_USE_AIRTABLE_PROXY=true or VITE_AIRTABLE_API_KEY in .env.local"
    );
  }
  return directFetchTable(tableId, params);
}

export async function fetchAllRecords(tableId, params = {}) {
  const allRecords = [];
  let offset;

  do {
    const pageParams = { ...params };
    if (offset) pageParams.offset = offset;
    const page = await airtableFetchTable(tableId, pageParams);
    if (!page || typeof page !== "object") {
      throw new Error("Airtable response missing page body");
    }
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

export function getStudentAssignedClass(fields) {
  if (!fields || typeof fields !== "object") return null;
  return getField(fields, SF.assigned_class);
}

function mapRecord(record) {
  const mapped = mapStudent(record, "ar");
  const fields = record?.fields ?? {};
  return {
    ...mapped,
    assignedClass: mapped.assignedClass ?? getStudentAssignedClass(fields),
  };
}

/** Match a student from a live registry by child code, record id, or name fragment. */
export function findStudentByIdentifier(students, identifier) {
  if (!identifier || !Array.isArray(students)) return null;
  const needle = String(identifier).trim().toLowerCase().replace(/\s+/g, "");
  if (!needle) return null;

  return (
    students.find((student) => {
      const code = String(student?.studentCode ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");
      const id = String(student?.id ?? "")
        .trim()
        .toLowerCase();
      const name = String(student?.name ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");
      return (
        (code && (code === needle || code.includes(needle) || needle.includes(code))) ||
        (id && id === needle) ||
        (name && name.includes(needle))
      );
    }) ?? null
  );
}

export async function fetchStudents() {
  const records = await loadStudentRecords();
  if (!Array.isArray(records)) return [];
  return records.map(mapRecord);
}

const ACTIVE_PERMISSION_MARKERS = ["active", "نشط", "مفعل", "فعال", "enabled", "approved", "معتمد"];

async function airtableWrite(tableId, method, body, recordId) {
  const payload =
    body != null && typeof body === "object" && "fields" in body && body.typecast == null
      ? { ...body, typecast: true }
      : body;
  if (USE_PROXY) {
    return proxyFetch(tableId, { method, body: payload, recordId });
  }
  if (!hasDirectApiKey()) {
    throw new Error(
      "Airtable API key missing. Set VITE_USE_AIRTABLE_PROXY=true or VITE_AIRTABLE_API_KEY in .env.local"
    );
  }
  return directWrite(tableId, method, payload, recordId);
}

function scrubFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return out;
}

/** Parse Airtable 422 body — surface unknown field / invalid select for UI. */
export function formatAirtableWriteError(err) {
  const msg = String(err?.message ?? "");
  let body = msg;
  const colon = msg.indexOf(": ");
  if (colon >= 0) body = msg.slice(colon + 2);
  try {
    const parsed = JSON.parse(body);
    const ae = parsed?.error ?? parsed;
    const type = ae?.type ?? "";
    const message = ae?.message ?? msg;
    if (type === "UNKNOWN_FIELD_NAME" || /unknown field name/i.test(message)) {
      const m = String(message).match(/Unknown field name: "?([^"\n]+)"?/i);
      const bad = m?.[1]?.trim();
      return bad
        ? `UNKNOWN_FIELD_NAME: "${bad}" — create or rename this column in Airtable Students table`
        : `UNKNOWN_FIELD_NAME: ${message}`;
    }
    if (type === "INVALID_MULTIPLE_CHOICE_OPTIONS") {
      return `INVALID_SELECT_OPTION: ${message}`;
    }
    if (/insufficient permissions to create new select option/i.test(message)) {
      const opt = String(message).match(/option\s+"?([^"]+)"?/i)?.[1]?.trim() ?? "unknown";
      return (
        `SELECT_OPTION_MISSING: "${opt}" — in Airtable add this option to the dropdown, or use a token with schema.bases:write. ` +
        `Required: status→new,active | subscription_status→pending,active | preferred_destination→media,registry,community,diagnostics`
      );
    }
    if (type) return `${type}: ${message}`;
    return message;
  } catch {
    if (/UNKNOWN_FIELD_NAME/i.test(msg)) return msg;
    return msg || "Airtable write failed";
  }
}

export async function createAirtableRecord(tableId, fields) {
  if (!tableId) throw new Error("tableId required");
  try {
    const data = await airtableWrite(tableId, "POST", { fields: scrubFields(fields) });
    return data?.id ? data : mapRecord(data);
  } catch (err) {
    throw new Error(formatAirtableWriteError(err));
  }
}

export async function updateAirtableRecord(tableId, recordId, fields) {
  if (!tableId || !recordId) throw new Error("tableId and recordId required");
  try {
    const data = await airtableWrite(tableId, "PATCH", { fields: fields ?? {} }, recordId);
    return data?.id ? data : mapRecord(data);
  } catch (err) {
    throw new Error(formatAirtableWriteError(err));
  }
}

export async function createStudentRecord(fields) {
  try {
    const data = await airtableWrite(STUDENTS_TABLE, "POST", { fields: scrubFields(fields) });
    return mapRecord(data);
  } catch (err) {
    throw new Error(formatAirtableWriteError(err));
  }
}

export async function updateStudentRecord(recordId, fields) {
  if (!recordId) throw new Error("recordId required");
  try {
    const data = await airtableWrite(STUDENTS_TABLE, "PATCH", { fields: fields ?? {} }, recordId);
    return mapRecord(data);
  } catch (err) {
    throw new Error(formatAirtableWriteError(err));
  }
}

export async function saveStudentFaceBiometric(
  recordId,
  descriptorJson,
  { captureStatus = REFERENCE_CAPTURE_APPROVED_STATUS } = {}
) {
  if (!recordId) throw new Error("recordId required");
  if (!descriptorJson || !String(descriptorJson).trim()) {
    throw new Error("face_biometric descriptor required");
  }
  // Single PATCH — face_biometric + biometric_status together (production Students)
  return updateStudentRecord(recordId, {
    [SF.face_biometric]: descriptorJson,
    [SF.biometric_status]: captureStatus,
  });
}

/** Mark student Status active after enrollment data — does NOT touch subscription_status. */
export async function promoteStudentStatus(recordId) {
  if (!recordId) throw new Error("recordId required");
  return updateStudentRecord(recordId, {
    [SF.status]: DEFAULT_ENROLLMENT_STATUS,
  });
}

/** Save free quick-assessment result on student record. */
export async function saveInitialAssessmentScore(recordId, scorePayload) {
  if (!recordId) throw new Error("recordId required");
  const scoreValue =
    typeof scorePayload === "object" && scorePayload?.score != null
      ? Number(scorePayload.score)
      : typeof scorePayload === "number"
        ? scorePayload
        : null;

  const fields = {};
  if (scoreValue != null && Number.isFinite(scoreValue)) {
    fields[SF.initial_assessment_score] = scoreValue;
  } else if (typeof scorePayload === "string") {
    fields[SF.initial_assessment_score] = scorePayload;
  }

  if (typeof scorePayload === "object" && scorePayload != null) {
    fields[SF.initial_assessment_score] =
      scorePayload.score ?? fields[SF.initial_assessment_score];
  }

  fields[SF.comprehensive_assessment_status] = "not_started";

  return updateStudentRecord(recordId, fields);
}

export async function updateSpecialistRecord(recordId, fields) {
  if (!recordId) throw new Error("recordId required");
  const data = await airtableWrite(AIRTABLE_TABLES.specialists, "PATCH", { fields: fields ?? {} }, recordId);
  return mapRecord(data);
}

function isPermissionRecordActive(fields) {
  if (!fields || typeof fields !== "object") return false;
  const status = getField(fields, AF.status);
  if (status == null || status === "") return false;
  const v = String(status).trim().toLowerCase();
  if (/denied|inactive|مرفوض|معطل|disabled/.test(v)) return false;
  return ACTIVE_PERMISSION_MARKERS.some((m) => v.includes(m)) || v === "true" || v === "1";
}

/** True when linked access-control records grant an active camera permission. */
export async function hasActiveCameraPermission(student) {
  const ids = student?.cameraAccessIds;
  const list = Array.isArray(ids) ? ids : [];
  if (!list.length) return false;

  const records = await fetchAirtableRecords(AIRTABLE_TABLES.accessControl);
  return list.some((id) => {
    const rec = records.find((r) => r.id === id);
    return rec ? isPermissionRecordActive(rec.fields) : false;
  });
}

/** Create active camera permission in Access Control and link to student record. */
export async function createCameraAccessPermission(studentRecordId, studentName) {
  if (!studentRecordId) return null;

  try {
    const permissionFields = scrubFields({
      [AF.user_name]: studentName ? `Camera — ${studentName}` : "Camera Access",
      [AF.status]: "active",
      [AF.permissions]: "camera_biometric",
      [AF.access_level]: "parent",
    });

    const data = await airtableWrite(AIRTABLE_TABLES.accessControl, "POST", {
      fields: permissionFields,
    });
    const permissionRecord = data;

    if (!permissionRecord?.id) return null;

    try {
      await updateStudentRecord(studentRecordId, {
        [SF.camera_access]: [permissionRecord.id],
      });
    } catch {
      /* permission created but link failed — non-blocking */
    }

    return permissionRecord;
  } catch (err) {
    console.warn(
      "[airtable] createCameraAccessPermission skipped:",
      formatAirtableWriteError(err)
    );
    return null;
  }
}

const DAILY_SESSIONS_LS = "aunak.dailySessions.v1";
const LEDGER_OVERRIDE_LS = "aunak.ledgerOverride.v1";

/** Canonical Daily Sessions columns — snake_case. */
export const DAILY_SESSION_FIELDS = {
  sessionDate: DS_FIELDS.session_date,
  specialistName: DS_FIELDS.specialist_name,
  studentName: DS_FIELDS.student_name,
  notes: DS_FIELDS.notes,
  claimStatus: DS_FIELDS.claim_status,
  sealedAt: DS_FIELDS.sealed_at,
  specialistSignature: DS_FIELDS.specialist_signature,
  immutableHash: DS_FIELDS.immutable_hash,
  sessionSequence: DS_FIELDS.session_sequence,
  pinVerified: DS_FIELDS.pin_verified,
};

const DS = DAILY_SESSION_FIELDS;
const CLAIM_STATUS_SEALED = "Sealed";

function isCloudDailySessionsTable() {
  return Boolean(AIRTABLE_TABLES.dailySessions);
}

function normalizeSessionDate(date) {
  if (!date) return new Date().toISOString().slice(0, 10);
  const s = String(date).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function readDailySessionsBackup() {
  try {
    const raw = localStorage.getItem(DAILY_SESSIONS_LS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDailySessionsBackup(records) {
  try {
    localStorage.setItem(DAILY_SESSIONS_LS, JSON.stringify(records));
  } catch {
    /* ignore */
  }
}

function backupRecordFromAirtable(record) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return {
    id: record?.id ?? "local-" + Date.now() + "-" + suffix,
    fields: { ...(record?.fields ?? record) },
  };
}

function appendDailySessionBackup(fields) {
  const list = readDailySessionsBackup();
  list.push(backupRecordFromAirtable({ fields }));
  writeDailySessionsBackup(list);
}

function updateDailySessionBackup(recordId, patchFields) {
  const list = readDailySessionsBackup();
  const idx = list.findIndex((r) => r.id === recordId);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      fields: { ...list[idx].fields, ...patchFields },
    };
  } else {
    list.push(backupRecordFromAirtable({ id: recordId, fields: patchFields }));
  }
  writeDailySessionsBackup(list);
}

function readLedgerOverrides() {
  try {
    const raw = localStorage.getItem(LEDGER_OVERRIDE_LS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLedgerOverride(day, email, count) {
  try {
    const all = readLedgerOverrides();
    all[`${day}|${normalizeEmail(email)}`] = count;
    localStorage.setItem(LEDGER_OVERRIDE_LS, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

function readLedgerOverride(day, email) {
  const all = readLedgerOverrides();
  const v = all[`${day}|${normalizeEmail(email)}`];
  return v != null ? Number(v) : null;
}

async function resolveSpecialistDisplayName(specialistEmail, specialistName) {
  if (specialistName?.trim()) return specialistName.trim();
  if (!specialistEmail) return "";
  const ac = await fetchAccessControlByEmail(specialistEmail);
  const name = getField(ac?.fields ?? {}, AF.user_name);
  return name?.trim() || specialistEmail;
}

function filterBackupClaims(date, specialistName) {
  const day = normalizeSessionDate(date);
  const name = String(specialistName ?? "").trim().toLowerCase();
  return readDailySessionsBackup().filter((rec) => {
    const f = rec.fields ?? {};
    const recDay = normalizeSessionDate(f[DS.sessionDate]);
    const recName = String(f[DS.specialistName] ?? "").trim().toLowerCase();
    const st = String(f[DS.claimStatus] ?? "").trim();
    return recDay === day && recName === name && (st === CLAIM_STATUS_SEALED || st === "");
  });
}

function dailyClaimsFormula(date, specialistName) {
  const day = normalizeSessionDate(date);
  const name = String(specialistName).replace(/'/g, "\\'");
  return (
    "AND({" +
    DS.sessionDate +
    "}='" +
    day +
    "', {" +
    DS.claimStatus +
    "}='" +
    CLAIM_STATUS_SEALED +
    "', {" +
    DS.specialistName +
    "}='" +
    name +
    "')"
  );
}

export async function fetchDailyClaimsForDate(date, specialistEmail, specialistName) {
  const tableId = AIRTABLE_TABLES.dailySessions;
  const name = await resolveSpecialistDisplayName(specialistEmail, specialistName);
  if (!tableId) {
    return filterBackupClaims(date, name);
  }
  try {
    const formula = dailyClaimsFormula(date, name);
    return await fetchAllRecords(tableId, { filterByFormula: formula });
  } catch (err) {
    if (isCloudDailySessionsTable()) throw err;
    return filterBackupClaims(date, name);
  }
}

function filterBackupClaimsByStudent(studentName, startDate, endDate) {
  const name = String(studentName ?? "").trim().toLowerCase();
  const start = normalizeSessionDate(startDate);
  const end = normalizeSessionDate(endDate);
  return readDailySessionsBackup().filter((rec) => {
    const f = rec.fields ?? {};
    const recName = String(f[DS.studentName] ?? "").trim().toLowerCase();
    const recDay = normalizeSessionDate(f[DS.sessionDate]);
    const st = String(f[DS.claimStatus] ?? "").trim();
    return (
      recName === name &&
      recDay >= start &&
      recDay <= end &&
      (st === CLAIM_STATUS_SEALED || st === "")
    );
  });
}

function sealedClaimsByStudentFormula(studentName, startDate, endDate) {
  const name = String(studentName).replace(/'/g, "\\'");
  const start = normalizeSessionDate(startDate);
  const end = normalizeSessionDate(endDate);
  return (
    "AND({" +
    DS.studentName +
    "}='" +
    name +
    "', {" +
    DS.claimStatus +
    "}='" +
    CLAIM_STATUS_SEALED +
    "', {" +
    DS.sessionDate +
    "}>='" +
    start +
    "', {" +
    DS.sessionDate +
    "}<='" +
    end +
    "')"
  );
}

/** Sealed claims for a student within a date range — report engine source. */
export async function fetchSealedClaimsForStudent({ studentName, startDate, endDate }) {
  const tableId = AIRTABLE_TABLES.dailySessions;
  const name = String(studentName ?? "").trim();
  if (!name) return [];
  const start = normalizeSessionDate(startDate);
  const end = normalizeSessionDate(endDate);
  if (!tableId) {
    return filterBackupClaimsByStudent(name, start, end);
  }
  try {
    const formula = sealedClaimsByStudentFormula(name, start, end);
    return await fetchAllRecords(tableId, { filterByFormula: formula });
  } catch (err) {
    if (isCloudDailySessionsTable()) throw err;
    return filterBackupClaimsByStudent(name, start, end);
  }
}

export async function fetchCenterLedgerForDate(date, specialistEmail) {
  void date;
  void specialistEmail;
  return null;
}

export async function createDailySessionClaim({
  specialistEmail,
  specialistName,
  studentId,
  studentName,
  sessionFee,
  notes,
  sessionDate,
  aunAttestation,
  aunAttestationAt,
}) {
  return createSealedSessionClaim({
    specialistEmail,
    specialistName,
    studentId,
    studentName,
    sessionFee,
    notes,
    sessionDate,
    aunAttestation,
    aunAttestationAt,
    sealed: false,
  });
}

export async function createSealedSessionClaim({
  specialistEmail,
  specialistName,
  studentId,
  studentName,
  sessionFee,
  notes,
  sessionDate,
  aunAttestation,
  aunAttestationAt,
  sequence,
  signature,
  immutableHash,
  pinVerified,
  sealed = true,
}) {
  void specialistEmail;
  void studentId;
  void sessionFee;
  void aunAttestation;
  void aunAttestationAt;

  const day = normalizeSessionDate(sessionDate);
  const displayName = specialistName?.trim() || (await resolveSpecialistDisplayName(specialistEmail, null));

  const fields = scrubFields({
    [DS.sessionDate]: day,
    [DS.specialistName]: displayName,
    [DS.studentName]: studentName,
    [DS.notes]: notes ?? "",
    ...(sealed
      ? {
          [DS.claimStatus]: CLAIM_STATUS_SEALED,
          [DS.sealedAt]: new Date().toISOString(),
          [DS.sessionSequence]: sequence,
          [DS.immutableHash]: immutableHash,
          [DS.pinVerified]: Boolean(pinVerified),
          [DS.specialistSignature]: signature ? JSON.stringify(signature) : "",
        }
      : {}),
  });

  const tableId = AIRTABLE_TABLES.dailySessions;
  if (!tableId) {
    appendDailySessionBackup(fields);
    return { id: "local-claim-" + Date.now(), fields };
  }

  const data = await airtableWrite(tableId, "POST", { fields });
  return data;
}

/** Cloud tblDailySessions: ledger count = sealed claim count (100% sync). */
export async function syncLedgerToClaimCount(date, specialistEmail, specialistName) {
  const day = normalizeSessionDate(date);
  const name = await resolveSpecialistDisplayName(specialistEmail, specialistName);
  const claims = await fetchDailyClaimsForDate(day, specialistEmail, name);
  const sealedCount = (claims || []).length;
  if (isCloudDailySessionsTable()) {
    writeLedgerOverride(day, specialistEmail, sealedCount);
    return { synced: true, count: sealedCount, cloud: true };
  }
  writeLedgerOverride(day, specialistEmail, sealedCount);
  return { synced: true, count: sealedCount };
}

export { assertClaimNotSealed } from "./sealedClaims";

/** Fetch access control record by specialist email (for PIN verification). */
export async function fetchAccessControlByEmail(email) {
  const target = normalizeEmail(email);
  if (!target) return null;
  const records = await fetchAirtableRecords(AIRTABLE_TABLES.accessControl);
  return (
    records.find((r) => {
      const em = getField(r.fields, AF.user_email);
      return em != null && normalizeEmail(em) === target;
    }) ?? null
  );
}

export async function setCenterLedgerCount(date, specialistEmail, count, specialistName) {
  const day = normalizeSessionDate(date);
  const n = Number(count);
  const sessionCount = Number.isFinite(n) ? n : 0;
  writeLedgerOverride(day, specialistEmail, sessionCount);
  return { id: `ledger-override-${day}`, fields: { sessionCount } };
}

export async function approveDailyReconciliation(date, specialistEmail, specialistName) {
  const day = normalizeSessionDate(date);
  const claims = await fetchDailyClaimsForDate(day, specialistEmail, specialistName);
  const sealedCount = (claims || []).length;
  writeLedgerOverride(day, specialistEmail, sealedCount);
  return { approved: true, count: sealedCount };
}

export async function getDailyReconciliation(date, specialistEmail, specialistName) {
  const day = normalizeSessionDate(date);
  const name = await resolveSpecialistDisplayName(specialistEmail, specialistName);
  const claims = await fetchDailyClaimsForDate(day, specialistEmail, name);

  const claimCount = (Array.isArray(claims) ? claims : []).filter((c) => {
    const st = String(c?.fields?.[DS.claimStatus] ?? "").trim();
    return st === CLAIM_STATUS_SEALED || st === "";
  }).length;

  const override = readLedgerOverride(day, specialistEmail);
  const ledgerCountSafe =
    override != null && Number.isFinite(override) ? override : claimCount;
  const difference = ledgerCountSafe - claimCount;
  const sovereignApproved = difference === 0 && claimCount > 0;
  const hasMismatch = difference !== 0;

  return {
    claimCount,
    ledgerCount: ledgerCountSafe,
    difference,
    sovereignApproved,
    hasMismatch,
    ledgerRecordId: null,
    cloudTableId: AIRTABLE_TABLES.dailySessions,
  };
}

export const GOAL_ATTEMPT_FIELDS = {
  student: GA_FIELDS.student,
  sessionId: GA_FIELDS.session_id,
  sessionDate: GA_FIELDS.session_date,
  goalLabel: GA_FIELDS.goal_label,
  goalSource: GA_FIELDS.goal_source,
  successPercent: GA_FIELDS.success_percent,
  attemptNumber: GA_FIELDS.attempt_number,
  specialistEmail: GA_FIELDS.specialist_email,
  attemptNotes: GA_FIELDS.attempt_notes,
  recordedAt: GA_FIELDS.recorded_at,
};

const GOAL_ATTEMPTS_LS = "aunak.goalAttempts.v1";
const GA = GOAL_ATTEMPT_FIELDS;

function readGoalAttemptsBackup() {
  try {
    const raw = localStorage.getItem(GOAL_ATTEMPTS_LS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGoalAttemptsBackup(records) {
  try {
    localStorage.setItem(GOAL_ATTEMPTS_LS, JSON.stringify(records));
  } catch {
    /* ignore */
  }
}

function appendGoalAttemptBackup(fields) {
  const list = readGoalAttemptsBackup();
  list.push({
    id: "local-attempt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    fields: { ...fields },
  });
  writeGoalAttemptsBackup(list);
}

function goalAttemptsTableId() {
  const id = AIRTABLE_TABLES.goalAttempts;
  return id && String(id).trim() ? String(id).trim() : null;
}

function goalAttemptFromBackup(rec) {
  return {
    id: rec.id,
    fields: rec.fields ?? rec,
  };
}

function filterGoalAttemptsBackup({ sessionId, studentId, weekStart, weekEnd }) {
  return readGoalAttemptsBackup().filter((rec) => {
    const f = rec.fields ?? {};
    if (sessionId && String(f[GA.sessionId] ?? "") !== String(sessionId)) return false;
    if (studentId) {
      const linked = f[GA.student];
      const ids = Array.isArray(linked) ? linked : linked ? [linked] : [];
      if (ids.length && !ids.includes(studentId)) return false;
    }
    if (weekStart || weekEnd) {
      const day = normalizeSessionDate(f[GA.sessionDate]);
      if (weekStart && day < weekStart) return false;
      if (weekEnd && day > weekEnd) return false;
    }
    return true;
  });
}

export async function createGoalAttempt({
  studentId,
  sessionId,
  sessionDate,
  goalLabel,
  goalSource,
  successPercent,
  attemptNumber,
  specialistEmail,
  attemptNotes,
}) {
  const day = normalizeSessionDate(sessionDate);
  const recordedAt = new Date().toISOString();
  const fields = scrubFields({
    [GA.sessionId]: sessionId,
    [GA.sessionDate]: day,
    [GA.goalLabel]: goalLabel,
    [GA.goalSource]: goalSource,
    [GA.successPercent]: successPercent,
    [GA.attemptNumber]: attemptNumber,
    [GA.specialistEmail]: normalizeEmail(specialistEmail) || specialistEmail,
    [GA.attemptNotes]: attemptNotes,
    [GA.recordedAt]: recordedAt,
  });
  if (studentId) fields[GA.student] = [studentId];

  const tableId = goalAttemptsTableId();
  if (!tableId) {
    appendGoalAttemptBackup(fields);
    return { id: "local-attempt-" + Date.now(), fields };
  }

  try {
    const data = await airtableWrite(tableId, "POST", { fields });
    appendGoalAttemptBackup(data.fields ?? fields);
    return data;
  } catch (err) {
    console.warn("[airtable] createGoalAttempt backup:", err.message);
    appendGoalAttemptBackup(fields);
    return { id: "local-attempt-" + Date.now(), fields };
  }
}

export async function fetchSessionGoalAttempts(sessionId) {
  if (!sessionId) return [];
  const tableId = goalAttemptsTableId();
  const sid = String(sessionId).replace(/'/g, "\\'");
  if (tableId) {
    try {
      const formula = `{${GA.sessionId}}='${sid}'`;
      return await fetchAllRecords(tableId, { filterByFormula: formula });
    } catch (err) {
      console.warn("[airtable] fetchSessionGoalAttempts failed, using backup:", err.message);
    }
  }
  return filterGoalAttemptsBackup({ sessionId }).map(goalAttemptFromBackup);
}

export async function fetchWeeklyGoalAttempts({ studentId, weekStart, weekEnd }) {
  const start = normalizeSessionDate(weekStart);
  const end = normalizeSessionDate(weekEnd);
  const tableId = goalAttemptsTableId();

  if (tableId) {
    try {
      const formula =
        "AND(IS_AFTER({" +
        GA.sessionDate +
        "}, DATEADD('" +
        start +
        "', -1, 'days')), IS_BEFORE({" +
        GA.sessionDate +
        "}, DATEADD('" +
        end +
        "', 1, 'days')))";
      const records = await fetchAllRecords(tableId, { filterByFormula: formula });
      if (!studentId) return records;
      return records.filter((rec) => {
        const linked = rec?.fields?.[GA.student];
        const ids = Array.isArray(linked) ? linked : linked ? [linked] : [];
        return ids.includes(studentId);
      });
    } catch (err) {
      console.warn("[airtable] fetchWeeklyGoalAttempts failed, using backup:", err.message);
    }
  }

  return filterGoalAttemptsBackup({ studentId, weekStart: start, weekEnd: end }).map(
    goalAttemptFromBackup
  );
}

